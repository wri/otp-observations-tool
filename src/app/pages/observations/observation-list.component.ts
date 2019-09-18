import { TranslateService } from '@ngx-translate/core';
import * as truncate from 'lodash/truncate';
import { JsonApiParams } from 'app/services/json-api.service';
import { AuthService } from 'app/services/auth.service';
import { NavigationItem } from 'app/shared/navigation/navigation.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { ObservationsService } from 'app/services/observations.service';
import { Observation } from 'app/models/observation.model';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';

@Component({
  selector: 'otp-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.scss']
})
export class ObservationListComponent extends TableFilterBehavior {

  private selected = [];
  private editURL: string;
  statusFilterValues: any = {};
  typeFilterValues: any = [];

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

    this.translateService.onLangChange.subscribe(() => {
      this.updateStatusFilterValues();
      this.updateTypeFilterValues();
    });
  }

  /**
   * Update the values for the status filter according to
   * the current language
   */
  async updateStatusFilterValues() {
    await Promise.all([
      this.translateService.get('Created').toPromise(),
      this.translateService.get('Ready for revision').toPromise(),
      this.translateService.get('Under revision').toPromise(),
      this.translateService.get('Approved').toPromise(),
      this.translateService.get('Rejected').toPromise()
    ]).then(([created, ready, revision, approved, rejected]) => {
      // We sort the values by alphabetical order
      const values = {
        [created]: 'Created',
        [ready]: 'Ready for revision',
        [revision]: 'Under revision',
        [approved]: 'Approved',
        [rejected]: 'Rejected'
      };
      return Object.keys(values)
        .sort()
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

  /**
   * Return whether the logged user can edit or delete an observation
   * @param {Observation} observation
   * @returns {boolean}
   */
  canEdit(observation: Observation): boolean {
    if (observation['validation-status'] !== 'Created' && observation['validation-status'] !== 'Under revision') {
      return false;
    }

    return !!observation.observers.find(o => o.id === this.authService.userObserverId);
  }

  shortenText(text: string): string {
    return truncate(text, { length: 100, separator: /,?\.?;? +/ });
  }
}
