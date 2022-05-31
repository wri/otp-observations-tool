import { Router, ActivatedRoute } from '@angular/router';
import { ObservationReport } from 'app/models/observation_report';
import { environment } from 'environments/environment';
import { Component, AfterViewInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { JsonApiParams } from './../../../services/json-api.service';
import { ObservationReportsService } from 'app/services/observation-reports.service';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';

@Component({
  selector: 'otp-report-library',
  templateUrl: './report-library.component.html',
  styleUrls: ['./report-library.component.scss']
})
export class ReportLibraryComponent extends TableFilterBehavior implements AfterViewInit {

  apiUrl = environment.apiUrl;

  constructor(
    protected service: ObservationReportsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.filters.defaultApiParams = {
      'filter[observer-id]': this.authService.userObserverId
    };
    super.ngAfterViewInit();
  }

  onClickNewReport() {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  onEdit(report: ObservationReport) {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([`edit/${report.id}`], { relativeTo: this.route });
  }
}
