import { ProfileComponent } from 'app/pages/profile/profile.component';
import { FieldsComponent } from 'app/pages/fields/fields.component';
import { UsersComponent } from 'app/pages/user/users.component';
import { AuthGuard } from 'app/services/auth.guard';
import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { LoginComponent } from 'app/pages/login/login.component';
import { RegisterComponent } from 'app/pages/register/register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObservationComponent } from 'app/pages/observation/observation.component';
import { UserDetailComponent } from "app/pages/user/userdetail.component";

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'observation/:id',
    component: ObservationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'observation',
    component: ObservationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user',
    component: UsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/new',
    component: UserDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'observation-field',
    component: FieldsComponent,
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
