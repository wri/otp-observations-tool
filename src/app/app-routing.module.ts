import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { CheckLoginGuard } from 'app/services/check-login.guard';
import { LoginComponent } from 'app/pages/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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
