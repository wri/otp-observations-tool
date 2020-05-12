import { TranslateService } from '@ngx-translate/core';
import * as truncate from 'lodash/truncate';
import { JsonApiParams } from 'app/services/json-api.service';
import { AuthService } from 'app/services/auth.service';
import { NavigationItem } from 'app/shared/navigation/navigation.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ObservationsService } from 'app/services/observations.service';
import { Observation } from 'app/models/observation.model';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { environment } from 'environments/environment';
import { DraftObservation } from 'app/models/draft_observation.interface';

@Component({
  selector: 'otp-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.scss']
})
export class ObservationListComponent extends TableFilterBehavior {
  apiUrl: string = environment.apiUrl;
  draftObservation: DraftObservation = JSON.parse(localStorage.getItem('draftObservation'));
  @ViewChild('uploadFile') uploadFile: ElementRef;

  tableOptions = {
    rows: {
      highlight: (observation: Observation) => observation['validation-status'] === 'Needs revision'
        || observation['validation-status'] === 'Ready for publication'
    }
  };

  private selected = [];
  private editURL: string;
  isUploading = false;
  response: any = {};
  statusFilterValues: any = {};
  typeFilterValues: any = [];
  archivedFilterValues: any = [];
  uploadWarningModalOpen = false;

  get isMyOTP(): boolean {
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    protected service: ObservationsService,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    super();

    this.updateStatusFilterValues();
    this.updateTypeFilterValues();
    this.updateArchivedFilterValues();

    this.translateService.onLangChange.subscribe(() => {
      this.updateStatusFilterValues();
      this.updateTypeFilterValues();
      this.updateArchivedFilterValues();
    });
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
        [submitted]: 'Ready for QC',
        [qc]: 'QC in progress',
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

  /**
   * Update the values for the archived filter according to
   * the current language
   */
  async updateArchivedFilterValues() {
    await Promise.all([
      this.translateService.get('Archived').toPromise(),
      this.translateService.get('Not archived').toPromise()
    ]).then(([archived, notArchived]) => {
      const values = {
        [archived]: true,
        [notArchived]: false
      };
      return Object.keys(values)
        .sort()
        .map(key => ({ [key]: values[key] }))
        .reduce((res, filter) => Object.assign(res, filter), {});
    }).then(archivedFilterValues => this.archivedFilterValues = archivedFilterValues);
  }

  onEdit(row): void {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([`../edit/${row.id}`], { relativeTo: this.route });
  }

  async onDelete(row) {
    if (confirm(await this.translateService.get('observationDeletion.confirm').toPromise())) {
      this.service.deleteObservationWithId(row.id)
        .then(async data => {
          alert(await this.translateService.get('observationDeletion.success').toPromise());
          this.loadData();
        });
    }
  }

  public uploadCSV(files: FileList): void {
    const file: File = files[0];
    const formData = new FormData();
    formData.append('import[file]', file);
    formData.append('import[importer_type]', 'observations');
    this.isUploading = true;
    this.service.uploadFile(formData).subscribe(
      (response) => {
        // For processing an empty object
        this.response = response && Object.keys(response).length ? response : null;
        this.uploadFile.nativeElement.value = '';
      },
      (error) => {
        console.error(error);
        this.translateService.get('uploadFile.errorHeader').subscribe(phrase => alert(phrase));
        this.isUploading = false;
        this.uploadFile.nativeElement.value = '';
      });
  }

  public onExit(needUpdate: boolean): void {
    this.isUploading = false;
    this.response = {};
    if (needUpdate) this.loadData();
  }

  /**
   * Return whether the logged user can edit or delete an observation
   * @param {Observation} observation
   * @returns {boolean}
   */
  canEdit(observation: Observation): boolean {
    if (observation.hidden || observation['validation-status'] !== 'Created') {
      return false;
    }

    return !!observation.observers.find(o => o.id === this.authService.userObserverId);
  }

  shortenText(text: string): string {
    return truncate(text, { length: 100, separator: /,?\.?;? +/ });
  }

  public onClone(observation: Observation): void {
    this.router.navigate([`../new`, { copiedId: observation.id }], { relativeTo: this.route });
  }

  public onCreate(useDraft = false): void {
    if (useDraft) {
      this.router.navigate([`../new`, { useDraft }], { relativeTo: this.route });
    } else {
      this.router.navigate([`../new`], { relativeTo: this.route });
    }
  }
}
