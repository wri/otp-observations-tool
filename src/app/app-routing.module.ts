import { ProfileComponent } from 'app/pages/profile/profile.component';
import { FieldsComponent } from 'app/pages/fields/fields.component';
import { UsersComponent } from 'app/pages/users/users.component';
import { AuthGuard } from 'app/services/auth.guard';
import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { LoginComponent } from 'app/pages/login/login.component';
import { RegisterComponent } from 'app/pages/register/register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObservationComponent } from 'app/pages/observation/observation.component';

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
    path: 'observation',
    component: ObservationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'fields',
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
