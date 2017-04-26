import { ProfileComponent } from 'app/pages/profile/profile.component';
import { FieldListComponent } from 'app/pages/fields/field-list.component';
import { FieldDetailComponent } from 'app/pages/fields/field-detail.component';
import { UserListComponent } from 'app/pages/users/user-list.component';
import { AuthGuard } from 'app/services/auth.guard';
import { ObservationListComponent } from 'app/pages/observations/observation-list.component';
import { LoginComponent } from 'app/pages/login/login.component';
import { RegisterComponent } from 'app/pages/register/register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObservationDetailComponent } from 'app/pages/observations/observation-detail.component';
import { UserDetailComponent } from 'app/pages/users/user-detail.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  // -------------OBSERVATIONS------------------
  {
    path: 'observations',
    component: ObservationListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'observations/:id',
    component: ObservationDetailComponent,
    canActivate: [AuthGuard]
  },
  // ----------------USERS----------------------
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users/:id/edit',
    component: UserDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users/new',
    component: UserDetailComponent,
    canActivate: [AuthGuard]
  },
  // -------------FIELDS------------
  {
    path: 'fields',
    component: FieldListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
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
