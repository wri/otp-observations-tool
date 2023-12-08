import { Observer } from 'app/models/observer.model';
import { ObserversService } from 'app/services/observers.service';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ObservationReportsService } from 'app/services/observation-reports.service';
import { ObservationReport } from 'app/models/observation_report';
import { DatastoreService } from 'app/services/datastore.service';
import { AuthService } from 'app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';

@Component({
  selector: 'otp-report-library-detail',
  templateUrl: './report-library-detail.component.html',
  styleUrls: ['./report-library-detail.component.scss']
})
export class ReportLibraryDetailComponent {
  loading = false;
  apiUrl = environment.apiUrl;
  report: ObservationReport = null;
  currentContextObserver = null;
  observers: Observer[] = [];

  // Multi-select options
  multiSelectTexts: IMultiSelectTexts = {};

  // Monitors multi-select related
  additionalObserversOptions: IMultiSelectOption[] = [];
  _additionalObserversSelection: string[] = [];
  additionalObserversSelectSettings: IMultiSelectSettings = {
    enableSearch: true
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private translateService: TranslateService,
    private datastoreService: DatastoreService,
    private observationReportsService: ObservationReportsService,
    private observersService: ObserversService
  ) {
    const setAdditionalObserversSelection = () => {
      if (this.report && this.observers.length) {
        this._additionalObserversSelection = this.report.observers
          .filter(observer => observer.id !== this.currentContextObserver.id)
          .map(observer => observer.id);
      }
    }

    // If we're editing a report, we need to fetch the model
    // and do a bit more stuff
    if (this.route.snapshot.params.id) {
      this.loading = true;

      this.observationReportsService.getById(this.route.snapshot.params.id, { include: 'observers' })
        .then(report => this.report = report)
        .then(setAdditionalObserversSelection)
        .catch(err => console.error(err))
        .then(() => this.loading = false); // TODO: visual feedback
    } else {
      this.report = this.datastoreService.createRecord(ObservationReport, {});
    }

    this.updateMultiSelectTexts();

    this.observersService.getAll({ sort: 'name' })
      .then((observers) => {
        this.observers = observers;

        // We update the list of options for the additional observers field
        this.additionalObserversOptions = observers
          .filter(observer => observer.id !== this.authService.userObserverId)
          .map((observer) => ({ id: observer.id, name: observer.name }));

        this.currentContextObserver = observers.find(o => o.id === this.authService.userObserverId);
      })
      .then(setAdditionalObserversSelection)
      .catch((err) => console.error(err)); // TODO: visual feedback
  }

  private async updateMultiSelectTexts() {
    await Promise.all([
      this.translateService.get('multiselect.checked').toPromise(),
      this.translateService.get('multiselect.checkedPlural').toPromise(),
      this.translateService.get('multiselect.defaultTitle').toPromise(),
      this.translateService.get('multiselect.allSelected').toPromise(),
    ]).then(([checked, checkedPlural, defaultTitle, allSelected]) => {
      this.multiSelectTexts = { checked, checkedPlural, defaultTitle, allSelected };
    });
  }

  onChangeAdditionalObserversOptions(options: string[]) {
    this._additionalObserversSelection = options;
  }

  onSubmit() {
    this.loading = true;
    const isEdition = !!this.report.id;

    this.report.observers = [
      this.currentContextObserver,
      ...this.observers.filter((o) => this._additionalObserversSelection.includes(o.id))
    ];
    this.report.save().toPromise()
      .then(async () => {
        if (isEdition) {
          alert(await this.translateService.get('reportUpdate.success').toPromise());
        } else {
          alert(await this.translateService.get('reportCreation.success').toPromise());
        }

        this.router.navigate(['/', 'private', 'my-otp', 'reports']);
      })
      .catch(async (err) => {
        if (isEdition) {
          alert(await this.translateService.get('reportUpdate.error').toPromise());
        } else {
          alert(await this.translateService.get('reportCreation.error').toPromise());
        }

        console.error(err);
      })
      .then(() => this.loading = false);
  }

  onCancel() {
    this.router.navigate(['/', 'private', 'my-otp', 'reports']);
  }

  onClickBack() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }
}
