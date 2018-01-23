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
    private authService: AuthService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    // We set a default filter which is to only show the
    // reports corresponding to the user's observer
    this.filters.getApiParams = () => {
      const filters = this.filters.filters
        .filter(filter => filter.selected !== null)
        .reduce((res, filter) => {
          return Object.assign({}, res, {
            [`filter[${filter.prop}]`]: filter.selected
          });
        }, {});

      return Object.assign({}, filters, { 'filter[observer-id]': this.authService.userObserverId });
    };

    super.ngAfterViewInit();
  }

}
