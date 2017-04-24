import { AuthGuard } from './services/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from 'app/pages/login/login.component';
import { ObservationComponent } from 'app/pages/observation/observation.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'observation',
    component: ObservationComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
