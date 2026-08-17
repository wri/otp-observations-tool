import { PageNotFoundComponent } from 'app/pages/page-not-found/page-not-found.component';
import { AlreadyLoggedGuard } from 'app/services/already-logged.guard';
import { AuthGuard } from 'app/services/auth.guard';
import { LoginComponent } from 'app/pages/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserRoleGuard } from 'app/services/user-role.guard';

// Only the login screen and the 404 page are part of the initial bundle; every other area is
// loaded on demand. Paths are unchanged from the previous eager routing table.
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [AlreadyLoggedGuard],
    component: LoginComponent
  },
  {
    path: 'private',
    canActivate: [AuthGuard],
    children: [
      // -------------MY OTP------------------
      {
        path: 'my-otp',
        canLoad: [AuthGuard],
        loadChildren: () => import('app/pages/my-otp/my-otp.module').then(m => m.MyOtpModule)
      },
      // -------------OBSERVATIONS------------------
      {
        path: 'observations',
        canLoad: [AuthGuard],
        loadChildren: () => import('app/pages/observations/observations.module').then(m => m.ObservationsModule)
      },
      // -------------FIELDS------------
      {
        path: 'fields',
        canLoad: [AuthGuard],
        loadChildren: () => import('app/pages/fields/fields.module').then(m => m.FieldsModule)
      },
      {
        path: 'profile',
        data: { authExcludeRoles: ['admin'] },
        canActivate: [UserRoleGuard],
        canLoad: [AuthGuard],
        loadChildren: () => import('app/pages/profile/profile.module').then(m => m.ProfileModule)
      }
    ]
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  // Declared last (before the catch-all) on purpose: an empty-path lazy route is probed for any
  // URL the routes above don't match, which would download this chunk on unrelated navigations.
  {
    path: '',
    loadChildren: () => import('app/pages/account/account.module').then(m => m.AccountModule)
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
