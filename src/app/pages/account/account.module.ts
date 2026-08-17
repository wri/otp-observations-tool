import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedUiModule } from 'app/shared/shared-ui.module';
import { RegisterComponent } from 'app/pages/register/register.component';
import { ForgotPasswordComponent } from 'app/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from 'app/pages/reset-password/reset-password.component';

// The public sign-up / password-recovery pages. Grouped into one lazy chunk because they are
// reached from the login screen and share the same shared-UI dependencies.
const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  }
];

@NgModule({
  imports: [
    SharedUiModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ]
})
export class AccountModule { }
