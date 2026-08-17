import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedUiModule } from 'app/shared/shared-ui.module';
import { FieldListComponent } from 'app/pages/fields/field-list.component';
import { FieldDetailComponent } from 'app/pages/fields/field-detail.component';
import { CategoryListComponent } from 'app/pages/fields/categories/category-list.component';
import { SubcategoryListComponent } from 'app/pages/fields/subcategories/subcategory-list.component';
import { GovernmentListComponent } from 'app/pages/fields/governments/government-list.component';
import { GovernmentDetailComponent } from 'app/pages/fields/governments/government-detail.component';
import { OperatorListComponent } from 'app/pages/fields/operators/operator-list.component';
import { OperatorDetailComponent } from 'app/pages/fields/operators/operator-detail.component';
import { LawListComponent } from 'app/pages/fields/laws/law-list.component';
import { LawDetailComponent } from 'app/pages/fields/laws/law-detail.component';
import { SeverityListComponent } from 'app/pages/fields/severities/severity-list.component';

// Kept identical to the child routes previously declared in AppRoutingModule.
const routes: Routes = [
  {
    path: '',
    component: FieldListComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'categories'
      },
      // --------------CATEGORIES--------------
      {
        path: 'categories',
        component: CategoryListComponent
      },
      // --------------SUB-CATEGORIES--------------
      {
        path: 'subcategories',
        component: SubcategoryListComponent,
      },
      // --------------GOVERNMENT ENTITIES-----------------
      {
        path: 'government-entities',
        component: GovernmentListComponent
      },
      {
        path: 'government-entities/new',
        component: GovernmentDetailComponent
      },
      {
        path: 'government-entities/edit/:id',
        component: GovernmentDetailComponent
      },
      // --------------OPERATORS-----------------
      {
        path: 'operators',
        component: OperatorListComponent
      },
      {
        path: 'operators/new',
        component: OperatorDetailComponent
      },
      {
        path: 'operators/edit/:id',
        component: OperatorDetailComponent
      },
      // --------------LAWS-----------------
      {
        path: 'laws',
        component: LawListComponent
      },
      {
        path: 'laws/new',
        component: LawDetailComponent
      },
      {
        path: 'laws/edit/:id',
        component: LawDetailComponent
      },
      // --------------SEVERITIES-----------------
      {
        path: 'severities',
        component: SeverityListComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    SharedUiModule,
    RouterModule.forChild(routes)
  ],
  // GovernmentDetailComponent and OperatorDetailComponent are declared by SharedUiModule
  // because the observations feature embeds them too.
  declarations: [
    FieldListComponent,
    FieldDetailComponent,
    CategoryListComponent,
    SubcategoryListComponent,
    GovernmentListComponent,
    OperatorListComponent,
    LawListComponent,
    LawDetailComponent,
    SeverityListComponent
  ]
})
export class FieldsModule { }
