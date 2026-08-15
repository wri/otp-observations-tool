import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedUiModule } from 'app/shared/shared-ui.module';
import { MyOTPComponent } from 'app/pages/my-otp/my-otp.component';
import { OrganizationProfileComponent } from 'app/pages/my-otp/profile/organization-profile.component';
import { ReportLibraryComponent } from 'app/pages/my-otp/report-library/report-library.component';
import { ReportLibraryDetailComponent } from 'app/pages/my-otp/report-library/report-library-detail.component';

// Kept identical to the child routes previously declared in AppRoutingModule.
const routes: Routes = [
  {
    path: '',
    component: MyOTPComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile',
      },
      {
        path: 'profile',
        component: OrganizationProfileComponent,
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
      }
    ]
  }
];

@NgModule({
  imports: [
    SharedUiModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    MyOTPComponent,
    OrganizationProfileComponent,
    ReportLibraryComponent,
    ReportLibraryDetailComponent
  ]
})
export class MyOtpModule { }
