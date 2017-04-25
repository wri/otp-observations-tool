import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { CheckLoginGuard } from 'app/services/check-login.guard';
import { LoginComponent } from 'app/pages/login/login.component';
import { RegisterComponent } from 'app/pages/register/register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from 'app/pages/login/login.component';
import { ObservationComponent } from 'app/pages/observation/observation.component';

const routes: Routes = [
  {
    path: '',
    children: [],
    component: ObservationsComponent,
    canActivate: [CheckLoginGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
    ],
  providers: [
    CheckLoginGuard
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
