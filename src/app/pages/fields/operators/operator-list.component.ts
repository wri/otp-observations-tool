import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/services/auth.service';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { OperatorsService } from 'app/services/operators.service';
import { Operator, OperatorTypes } from 'app/models/operator.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, AfterViewInit } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'otp-operator-list',
  templateUrl: './operator-list.component.html',
  styleUrls: ['./operator-list.component.scss']
})
export class OperatorListComponent extends TableFilterBehavior implements AfterViewInit {

  operatorTypeOptions: any = {};
  operatorTypes = Object.keys(OperatorTypes);
  activeFilterValues: any = [];
  isAdmin = this.authService.isAdmin();
  countryFilterParams: any = {};

  constructor(
    protected service: OperatorsService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private translateService: TranslateService
  ) {
    super();

    this.countryFilterParams = {
      'filter[id]': (this.authService.observerCountriesIds || []).join(',')
    };
    this.updateActiveFilterValues();
    this.updateTranslatedOptions(this.operatorTypes, 'operatorType');

    this.translateService.onLangChange.subscribe(() => {
      this.updateActiveFilterValues();
      this.updateTranslatedOptions(this.operatorTypes, 'operatorType');
    });
  }

  ngAfterViewInit(): void {
    this.filters.defaultApiParams = {
      'filter[country]': (this.authService.observerCountriesIds || []).join(',')
    };
    super.ngAfterViewInit();
  }

  triggerNewOperator(): void {
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
    let countries = this.authService.observerCountriesIds;

    if (countries.length) {
      return countries.includes(parseInt(operator.country.id));
    } else {
      return operator.country.id === this.authService.userCountryId;
    }
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

  private updateTranslatedOptions(phrases: string[], field: string): void {
    this[`${field}Options`] = {};
    const observables: Observable<string | any>[] =
      phrases.map(phrase => this.translateService.get(phrase));
    forkJoin(observables).subscribe((translatedPhrases: string[]) => {
      translatedPhrases.forEach((term, i) => {
        this[`${field}Options`][term] = phrases[i];
      });
    });
  }
}
