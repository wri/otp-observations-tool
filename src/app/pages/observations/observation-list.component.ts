import { TranslateService } from '@ngx-translate/core';
import * as truncate from 'lodash/truncate';
import { AuthService } from 'app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, ViewChild, ElementRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ObservationsService } from 'app/services/observations.service';
import { Observation } from 'app/models/observation.model';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { environment } from 'environments/environment';
import { NotificationService } from 'app/shared/notifications/notification.service';
import { ConfirmDialogService } from 'app/shared/confirm-dialog/confirm-dialog.service';
import { Subscription } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { OutboxEntry, OutboxService } from 'app/services/offline/outbox.service';
import { OfflinePreparationService, PreparationState } from 'app/services/offline/offline-preparation.service';
import { ObservationSubmissionService } from 'app/services/offline/observation-submission.service';
import { ConnectivityService } from 'app/services/offline/connectivity.service';

@Component({
  selector: 'otp-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ObservationListComponent extends TableFilterBehavior implements AfterViewInit, OnDestroy {
  apiUrl: string = environment.apiUrl;
  // Observations created on this device (drafts and those not accepted by the API yet)
  outboxEntries: OutboxEntry[] = [];
  preparation: PreparationState = null;
  private subscriptions = new Subscription();
  @ViewChild('uploadFile', { static: true }) uploadFile: ElementRef;
  @ViewChild('table', { static: true }) tableComponent: ElementRef;

  // Attributes of the observations themselves that the list needs. The relationships we
  // include are added to this fieldset by the table; everything else the API knows about
  // an observation (details, evidence, coordinates, comments...) stays on the server.
  tableFields = {
    observations: ['observation-type', 'validation-status', 'updated-at']
  };

  tableOptions = {
    rows: {
      highlight: (observation: Observation) =>
        ['Rejected', 'Needs revision', 'Ready for publication'].includes(observation['validation-status']) ||
        (observation['validation-status'] === 'Ready for QC1' && !!observation.observers.find(o => this.authService.qc1ObserverIds.includes(o.id))) ||
        (observation['validation-status'] === 'Ready for QC2' && !!observation.observers.find(o => this.authService.qc2ObserverIds.includes(o.id)))
    }
  };

  private selected = [];
  private editURL: string;
  isUploading = false;
  response: any = {};
  statusFilterValues: any = {};
  typeFilterValues: any = [];
  hiddenFilterValues: any = ['false', 'all'];
  countryFilterParams: any = {};
  operatorFilterParams: any = {};
  govFilterParams: any = {};
  fmuFilterParams: any = {};
  reportFilterParams: any = {};
  uploadWarningModalOpen = false;
  goToModalOpen = false;

  get isMyOTP(): boolean {
    // eslint-disable-next-line no-useless-escape -- escapes kept for readability of this regex
    return /my\-otp/.test(this.router.url);
  }

  get defaultObservationType() {
    return 'operator';
  }

  get observationType(): string {
    const filters = this.filters.getApiParams();
    if (Object.keys(filters).length) {
      return filters['filter[observation-type]'] || this.defaultObservationType;
    }

    return this.defaultObservationType;
  }

  get isObserverColumnVisible() {
    return this.authService.isBackendAdmin();
  }

  get isOnline(): boolean {
    return this.connectivity.isOnline;
  }

  get isOfflineAvailable(): boolean {
    return this.outboxService.isAvailable && this.preparationService.isAvailable;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    protected service: ObservationsService,
    private authService: AuthService,
    private translateService: TranslateService,
    private notifications: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private outboxService: OutboxService,
    private preparationService: OfflinePreparationService,
    private submissionService: ObservationSubmissionService,
    private connectivity: ConnectivityService
  ) {
    super();

    this.updateStatusFilterValues();
    this.updateTypeFilterValues();
    this.countryFilterParams = {
      'filter[id]': (this.authService.observerCountriesIds || []).join(',')
    };
    const observerIdFilter = { 'filter[observer_id]': this.authService.userObserverId };
    this.operatorFilterParams = observerIdFilter;
    this.govFilterParams = observerIdFilter;
    this.fmuFilterParams = observerIdFilter;
    this.reportFilterParams = observerIdFilter;

    const userId = this.authService.userId;
    const observerId = this.authService.userObserverId;
    // The draft the previous version kept in localStorage, if any, joins the outbox
    this.outboxService.migrateLegacyDraft(userId, observerId);
    this.subscriptions.add(
      this.outboxService.entriesForObserver$(userId, observerId).subscribe((entries) => this.outboxEntries = entries)
    );
    this.subscriptions.add(
      this.preparationService.state$.subscribe((state) => this.preparation = state)
    );
    // The table could not load while offline
    this.subscriptions.add(
      this.connectivity.onlineChanges.pipe(skip(1), filter((online) => online)).subscribe(() => this.loadData())
    );
    this.preparationService.loadState();

    this.translateService.onLangChange.subscribe(() => {
      this.updateStatusFilterValues();
      this.updateTypeFilterValues();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.filters.defaultApiParams = {
      'filter[hidden]': 'all',
      'filter[observer_id]': this.authService.userObserverId
    };
    super.ngAfterViewInit();
  }

  /**
   * Update the values for the status filter according to
   * the current language
   */
  async updateStatusFilterValues() {
    await Promise.all([
      this.translateService.get('Created').toPromise(),
      this.translateService.get('Ready for QC').toPromise(),
      this.translateService.get('QC in progress').toPromise(),
      this.translateService.get('Needs revision').toPromise(),
      this.translateService.get('Ready for publication').toPromise(),
      this.translateService.get('Published (no comments)').toPromise(),
      this.translateService.get('Published (not modified)').toPromise(),
      this.translateService.get('Published (modified)').toPromise()
    ]).then(([created, submitted, qc, revision, ready, publishedNoComments, publishedNotModified, publishedModified]) => {
      // We sort the values by alphabetical order
      const values = {
        [created]: 'Created',
        [submitted]: ['Ready for QC1', 'Ready for QC2'],
        [qc]: ['QC1 in progress', 'QC2 in progress'],
        [revision]: 'Needs revision',
        [ready]: 'Ready for publication',
        [publishedNoComments]: 'Published (no comments)',
        [publishedNotModified]: 'Published (not modified)',
        [publishedModified]: 'Published (modified)',
      };
      return Object.keys(values)
        .map(key => ({ [key]: values[key] }))
        .reduce((res, filter) => Object.assign(res, filter), {});

    }).then(statusFilterValues => this.statusFilterValues = statusFilterValues);
  }

  /**
   * Update the values for the type filter according to
   * the current language
   */
  async updateTypeFilterValues() {
    await Promise.all([
      this.translateService.get('Operator').toPromise(),
      this.translateService.get('Government').toPromise()
    ]).then(([operator, government]) => {
      const values = {
        [operator]: 'operator',
        [government]: 'government'
      };
      return Object.keys(values)
        .sort()
        .map(key => ({ [key]: values[key] }))
        .reduce((res, filter) => Object.assign(res, filter), {});
    }).then(typeFilterValues => this.typeFilterValues = typeFilterValues);
  }

  onEdit(row): void {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([`/private/observations/edit/${row.id}`]);
  }

  async onDelete(row) {
    if (await this.confirmDialog.confirm('observationDeletion.confirm', { confirmLabel: 'Delete', danger: true })) {
      this.service.deleteObservationWithId(row.id)
        .then(async data => {
          this.notifications.success('observationDeletion.success');
          this.loadData();
        });
    }
  }

  public uploadCSV(files: FileList): void {
    const file: File = files[0];
    const formData = new FormData();
    formData.append('import[file]', file);
    formData.append('import[importer_type]', 'observations');
    formData.append('import[importer_params]', JSON.stringify({ observer_ids: [parseInt(this.authService.userObserverId, 10)] }));
    this.isUploading = true;
    this.service.uploadFile(formData).subscribe(
      (response) => {
        // For processing an empty object
        this.response = response && Object.keys(response).length ? response : null;
        this.uploadFile.nativeElement.value = '';
      },
      (error) => {
        console.error(error);
        this.notifications.error('uploadFile.errorHeader');
        this.isUploading = false;
        this.uploadFile.nativeElement.value = '';
      });
  }

  public onExit(needUpdate: boolean): void {
    this.isUploading = false;
    this.response = {};
    if (needUpdate) this.loadData();
  }

  canCreate(): boolean {
    return this.authService.managedObserverIds.includes(this.authService.userObserverId);
  }

  /**
   * Return whether the logged user can edit an observation
   */
  canEdit(observation: Observation): boolean {
    if (!observation.observers.find(o => this.authService.managedObserverIds.includes(o.id))) return false;

    return observation['validation-status'] === 'Created';
  }

  /**
   * Return whether the logged user can delete an observation
   */
  canDelete(observation: Observation): boolean {
    if (!observation.observers.find(o => this.authService.managedObserverIds.includes(o.id))) return false;

    return ['Created', 'Rejected', 'Needs revision'].includes(observation['validation-status']);
  }

  shortenText(text: string): string {
    return truncate(text, { length: 100, separator: /,?\.?;? +/ });
  }

  public onClone(observation: Observation): void {
    this.router.navigate(['/private/observations/new', { copiedId: observation.id }]);
  }

  public onContinueEntry(entry: OutboxEntry): void {
    this.router.navigate(['/private/observations/new', { outboxId: entry.id }]);
  }

  public async onRetryEntry(entry: OutboxEntry): Promise<void> {
    await this.outboxService.setStatus(entry.id, 'queued');
    const result = await this.submissionService.submit(entry.id);

    if (result.status === 'sent') {
      this.loadData();
    } else if (result.status === 'failed') {
      this.notifications.error(await this.translateService.get('observationCreation.error').toPromise() + '\n' + result.message);
    } else {
      this.notifications.info('offline.deferredAlert');
    }
  }

  public async onDeleteEntry(entry: OutboxEntry): Promise<void> {
    if (await this.confirmDialog.confirm('offline.deleteConfirm', { confirmLabel: 'offline.delete', danger: true })) {
      await this.outboxService.remove(entry.id);
    }
  }

  public async onPrepareOffline(): Promise<void> {
    const state = await this.preparationService.prepare();
    // Success shows in the status line; only a failure needs the user's attention
    if (state.failures) {
      this.notifications.error('offline.prepareError');
    }
  }

  public onGoTo({ 'go-to-observation-id': observationId }: { 'go-to-observation-id': string }): void {
    this.router.navigate(['/', 'private', 'observations', 'edit', observationId]);
  }
}
