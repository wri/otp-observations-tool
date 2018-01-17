import { environment } from 'environments/environment';
import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { JsonApiParams } from './../../../services/json-api.service';
import { ObservationReportsService } from 'app/services/observation-reports.service';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';

@Component({
  selector: 'otp-report-library',
  templateUrl: './report-library.component.html',
  styleUrls: ['./report-library.component.scss']
})
export class ReportLibraryComponent extends TableFilterBehavior {

  apiUrl = environment.apiUrl;

  constructor(
    protected service: ObservationReportsService,
    private authService: AuthService
  ) {
    super();
  }

}
