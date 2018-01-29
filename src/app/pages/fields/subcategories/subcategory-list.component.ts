import { TranslateService } from '@ngx-translate/core';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { SubcategoriesService } from 'app/services/subcategories.service';
import { Subcategory } from 'app/models/subcategory.model';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-subcategory-list',
  templateUrl: './subcategory-list.component.html',
  styleUrls: ['./subcategory-list.component.scss']
})
export class SubcategoryListComponent extends TableFilterBehavior {

  typeFilterValues: any = [];
  requiredLocationFilterValues: any = [];

  constructor(
    protected service: SubcategoriesService,
    private router: Router,
    private translateService: TranslateService
  ) {
    super();

    this.updateTypeFilterValues();
    this.updateRequiredLocationFilterValues();
    this.translateService.onLangChange.subscribe(() => {
      this.updateTypeFilterValues();
      this.updateRequiredLocationFilterValues();
    });
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


  /**
   * Update the values for the required location filter
   * according to the current language
   */
  async updateRequiredLocationFilterValues() {
    await Promise.all([
      this.translateService.get('Yes').toPromise(),
      this.translateService.get('No').toPromise()
    ]).then(([yes, no]) => {
      const values = {
        [yes]: true,
        [no]: false
      };
      return Object.keys(values)
        .sort()
        .map(key => ({ [key]: values[key] }))
        .reduce((res, filter) => Object.assign(res, filter), {});
    }).then(requiredLocationFilterValues => this.requiredLocationFilterValues = requiredLocationFilterValues);
  }

}
