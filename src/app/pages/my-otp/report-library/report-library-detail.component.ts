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

@Component({
  selector: 'otp-report-library-detail',
  templateUrl: './report-library-detail.component.html',
  styleUrls: ['./report-library-detail.component.scss']
})
export class ReportLibraryDetailComponent {
  loading = false;
  apiUrl = environment.apiUrl;
  report: ObservationReport = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private translateService: TranslateService,
    private datastoreService: DatastoreService,
    private observationReportsService: ObservationReportsService,
    private observersService: ObserversService
  ) {
    // If we're editing a report, we need to fetch the model
    // and do a bit more stuff
    if (this.route.snapshot.params.id) {
      this.loading = true;

      this.observationReportsService.getById(this.route.snapshot.params.id)
        .then(report => this.report = report)
        .catch(err => console.error(err))
        .then(() => this.loading = false); // TODO: visual feedback
    } else {
      this.report = this.datastoreService.createRecord(ObservationReport, {});
    }
  }

  onSubmit() {
    this.loading = true;
    const isEdition = !!this.report.id;

    new Promise((resolve, reject) => {
      if (!this.report.id) {
        this.observersService.getById(this.authService.userObserverId)
          .then((observer) => {
            this.report.observers = [observer];
          })
          .then(<any>resolve)
          .catch(reject);
      } else {
        resolve();
      }
    }).then(() => this.report.save().toPromise())
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
