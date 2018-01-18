import { TranslateService } from '@ngx-translate/core';
import { Category } from './../../../models/category.model';
import { CategoriesService } from 'app/services/categories.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';

@Component({
  selector: 'otp-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent extends TableFilterBehavior {

  typeFilterValues: any = [];

  constructor(
    protected service: CategoriesService,
    private router: Router,
    private translateService: TranslateService
  ) {
    super();

    this.updateTypeFilterValues();
    this.translateService.onLangChange.subscribe(() => this.updateTypeFilterValues());
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

  // triggerNewCategory(): void {
  //   this.router.navigate(['private/fields/categories/new']);
  // }

  // onEdit(row): void {

  // }

  // private onDelete(category: Category): void {
  //   if (confirm(`Are you sure to delete the category: ${category.name}?`) ) {
  //     this.service.deleteCategory(category)
  //     .then((data) => {
  //       this.loadData();
  //       alert(data.json().messages[0].title);
  //     })
  //     .catch((e) => alert('Unable to delete the category: ${category.name} '));
  //   }
  // }


}
