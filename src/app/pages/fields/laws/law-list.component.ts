import { TranslateService } from '@ngx-translate/core';
import { Law } from 'app/models/law.model';
import { AuthService } from 'app/services/auth.service';
import { LawsService } from 'app/services/laws.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';

@Component({
  selector: 'otp-law-list',
  templateUrl: './law-list.component.html',
  styleUrls: ['./law-list.component.scss']
})
export class LawListComponent extends TableFilterBehavior {

  tableOptions = {
    rows: {
      highlight: row => !row.complete
    }
  };
  completeFilterValues: any = {};
  countryFilterParams: any = {};

  isAdmin = this.authService.isAdmin();

  constructor(
    protected service: LawsService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private translateService: TranslateService
  ) {
    super();

    this.countryFilterParams = {
      'filter[id]': (this.authService.observerCountriesIds || []).join(',')
    };
    this.updateCompleteFilterValues();
    this.translateService.onLangChange.subscribe(() => this.updateCompleteFilterValues());
  }

  ngAfterViewInit(): void {
    // We set a default filter
    this.filters.getApiParams = () => {
      const defaultFilters = {
        'filter[country]': (this.authService.observerCountriesIds || []).join(',')
      };
      const filters = this.filters.filters
        .filter(filter => filter.selected !== null)
        .reduce((res, filter) => {
          return Object.assign({}, res, {
            [`filter[${filter.prop}]`]: filter.selected
          });
        }, {});

      return {
        ...defaultFilters,
        ...filters,
      };
    };

    super.ngAfterViewInit();
  }

  /**
   * Update the values for the complete filter according to
   * the current language
   */
  async updateCompleteFilterValues() {
    await Promise.all([
      this.translateService.get('Complete').toPromise(),
      this.translateService.get('Incomplete').toPromise()
    ]).then(([complete, incomplete]) => {
      const values = {
        [complete]: true,
        [incomplete]: false
      };
      return Object.keys(values)
        .sort()
        .map(key => ({ [key]: values[key] }))
        .reduce((res, filter) => Object.assign(res, filter), {});
    }).then(completeFilterValues => this.completeFilterValues = completeFilterValues);
  }

  /**
   * Shorten the passed string and add an ellipsis
   * if necessary
   * @param {string} string String to shorten
   * @param {number} [limit=80] Character limit
   * @returns {string}
   */
  shorten(string: string, limit = 80): string {
    if (!string) {
      return null;
    }

    if (string.length <= limit) {
      return string;
    }

    return string.slice(0, limit) + '...';
  }

  onClickNewLaw() {
    this.router.navigate(['private', 'fields', 'laws', 'new']);
  }

  onEdit(row) {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([`edit/${row.id}`], { relativeTo: this.route });
  }

  /**
   * Return whether the logged user can edit the law
   * @param {Law} law
   * @returns {boolean}
   */
  canEdit(law: Law): boolean {
    if (!this.isAdmin) {
      return false;
    }
    let countries = this.authService.observerCountriesIds;

    if (countries.length) {
      // check if government.country is included into countries
      return countries.includes(parseInt(law.country.id));
    } else {
      return law.country.id === this.authService.userCountryId;
    }
  }

}
