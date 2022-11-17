import { ReportLibraryDetailComponent } from 'app/pages/my-otp/report-library/report-library-detail.component';
import { LawDetailComponent } from 'app/pages/fields/laws/law-detail.component';
import { LawListComponent } from 'app/pages/fields/laws/law-list.component';
import { SeverityListComponent } from 'app/pages/fields/severities/severity-list.component';
import { PageNotFoundComponent } from 'app/pages/page-not-found/page-not-found.component';
import { AlreadyLoggedGuard } from 'app/services/already-logged.guard';
import { SubcategoryListComponent } from 'app/pages/fields/subcategories/subcategory-list.component';
import { OperatorListComponent } from 'app/pages/fields/operators/operator-list.component';
import { OperatorDetailComponent } from 'app/pages/fields/operators/operator-detail.component';
import { GovernmentDetailComponent } from 'app/pages/fields/governments/government-detail.component';
import { GovernmentListComponent } from 'app/pages/fields/governments/government-list.component';
import { ProfileComponent } from 'app/pages/profile/profile.component';
import { FieldListComponent } from 'app/pages/fields/field-list.component';
import { FieldDetailComponent } from 'app/pages/fields/field-detail.component';
import { AuthGuard } from 'app/services/auth.guard';
import { ObservationListComponent } from 'app/pages/observations/observation-list.component';
import { LoginComponent } from 'app/pages/login/login.component';
import { RegisterComponent } from 'app/pages/register/register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObservationDetailComponent } from 'app/pages/observations/observation-detail.component';
import { CategoryListComponent } from 'app/pages/fields/categories/category-list.component';
import { OrganizationProfileComponent } from 'app/pages/my-otp/profile/organization-profile.component';
import { MyOTPComponent } from 'app/pages/my-otp/my-otp.component';
import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { ReportLibraryComponent } from 'app/pages/my-otp/report-library/report-library.component';
// import { ResetPasswordComponent } from 'app/pages/reset-password/reset-password.component';


const observationsChildren = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'operators'
  },
  {
    path: '',
    component: ObservationListComponent
  },
  {
    path: 'new',
    component: ObservationDetailComponent
  },
  {
    path: 'edit/:id',
    component: ObservationDetailComponent
  },
];

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [AlreadyLoggedGuard],
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  // {
  //   path: 'reset-password',
  //   component: ResetPasswordComponent
  // },
  {
    path: 'private',
    canActivate: [AuthGuard],
    children: [
      // -------------MY OTP------------------
      {
        path: 'my-otp',
        component: MyOTPComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'profile'
          },
          {
            path: 'profile',
            component: OrganizationProfileComponent
          },
          {
            path: 'reports',
            component: ReportLibraryComponent
          },
          {
            path: 'reports/new',
            component: ReportLibraryDetailComponent
          },
          {
            path: 'reports/edit/:id',
            component: ReportLibraryDetailComponent
          },
          // {
          //   path: 'observations',
          //   children: observationsChildren
          // }
        ]
      },
      // -------------OBSERVATIONS------------------
      {
        path: 'observations',
        component: ObservationsComponent,
        children: observationsChildren
      },
      // -------------FIELDS------------
      {
        path: 'fields',
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
      },
      {
        path: 'profile',
        component: ProfileComponent
      }
    ]
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  providers: [
    AuthGuard
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
