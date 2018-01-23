import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/services/auth.service';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { OperatorsService } from 'app/services/operators.service';
import { Operator } from 'app/models/operator.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, AfterViewInit } from '@angular/core';

export enum OperatorTypes {
  'Artisanal' = 'Artisanal',
  'Community forest' = 'Community forest',
  'Estate' = 'Estate',
  'Industrial agriculture' = 'Industrial agriculture',
  'Logging company' = 'Logging company',
  'Mining company' = 'Mining company',
  'Other' = 'Other',
  'Sawmill' = 'Sawmill',
  'Unknown' = 'Unknown'
}

@Component({
  selector: 'otp-operator-list',
  templateUrl: './operator-list.component.html',
  styleUrls: ['./operator-list.component.scss']
})
export class OperatorListComponent extends TableFilterBehavior implements AfterViewInit {

  operatorTypes = Object.keys(OperatorTypes);
  activeFilterValues: any = [];
  isAdmin = this.authService.isAdmin();

  constructor(
    protected service: OperatorsService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private translateService: TranslateService
  ) {
    super();

    this.updateActiveFilterValues();
  }

  ngAfterViewInit(): void {
    // We set a default filter which is to show the
    // the operators whether active or not
    this.filters.getApiParams = () => {
      const filters = this.filters.filters
        .filter(filter => filter.selected !== null)
        .reduce((res, filter) => {
          return Object.assign({}, res, {
            [`filter[${filter.prop}]`]: filter.selected
          });
        }, {});

      return Object.assign({}, { 'filter[is-active]': 'true, false' }, filters);
    };

    super.ngAfterViewInit();
  }

  triggerNewOperator(): void{
    this.router.navigate(['private/fields/operators/new']);
  }

  onEdit(row): void {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([`edit/${row.id}`], { relativeTo: this.route });
  }

  /**
   * Return whether the logged user can edit the operator
   * @param {Operator} operator
   * @returns {boolean}
   */
  canEdit(operator: Operator): boolean {
    if (!this.isAdmin) {
      return false;
    }

    return operator.country.id === this.authService.userCountryId;
  }

  /**
   * Update the values for the active filter according to
   * the current language
   */
  async updateActiveFilterValues() {
    await Promise.all([
      this.translateService.get('Active').toPromise(),
      this.translateService.get('Inactive').toPromise()
    ]).then(([active, inactive]) => {
      // We sort the values by alphabetical order
      const values = {
        [active]: true,
        [inactive]: false
      };
      return Object.keys(values)
        .sort()
        .map(key => ({ [key]: values[key] }))
        .reduce((res, filter) => Object.assign(res, filter), {});

    }).then(activeFilterValues => this.activeFilterValues = activeFilterValues);
  }

}
