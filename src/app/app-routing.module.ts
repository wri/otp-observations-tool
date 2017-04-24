import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from 'app/pages/login/login.component';
import { ObservationComponent } from 'app/pages/observation/observation.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: []
  },
  {
    path: 'observation',
    component: ObservationComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
