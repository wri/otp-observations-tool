import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
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

  get observationType(): string {
    const filters = super.getFiltersApiParams();
    return filters.type || 'operators';
  }

  get isMyOTP(): boolean {
    return /my\-otp/.test(this.router.url);
  }

  public getTableApiParams(): JsonApiParams {
    const params = super.getTableApiParams();

    if (this.isMyOTP) {
      params.user = 'current';
    }

    return params;
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

    this.translateService.onLangChange.subscribe(() => this.updateStatusFilterValues());
  }

  /**
   * Update the values for the status filter according to
   * the current language
   */
  async updateStatusFilterValues() {
    await Promise.all([
      this.translateService.get('Pending').toPromise(),
      this.translateService.get('Active').toPromise()
    ]).then(([ pending, active]) => {
      // We sort the values by alphabetical order
      const values = { [pending]: false, [active]: true };
      return Object.keys(values)
        .sort()
        .map(key => ({ [key]: values[key] }))
        .reduce((res, filter) => Object.assign(res, filter), {});

    }).then(statusFilterValues => this.statusFilterValues = statusFilterValues);
  }

  getFormatedDate(date: Date|string): string {
    return format(date, 'MM/DD/YYYY');
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
    const isAdmin = this.authService.userRole === 'admin';

    // If the user is an admin, they can do whatever they
    // want
    if (isAdmin) {
      return true;
    }

    // If the observation is active, only the admin users
    // can edit or delete it
    if (observation['is-active']) {
      return false;
    }

    // If the observation is not active, then only the person
    // who edited it can edit or remove it
    return observation.user && observation.user.id === this.authService.userId;
  }
}
