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

  constructor(
    protected service: SubcategoriesService,
    private router: Router
  ) {
    super();
  }

}
