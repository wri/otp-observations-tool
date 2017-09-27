import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { SeveritiesService } from 'app/services/severities.service';

@Component({
  selector: 'otp-severity-list',
  templateUrl: './severity-list.component.html',
  styleUrls: ['./severity-list.component.scss']
})
export class SeverityListComponent extends TableFilterBehavior {

  constructor(
    protected service: SeveritiesService,
    private router: Router
  ) {
    super();
  }

}
