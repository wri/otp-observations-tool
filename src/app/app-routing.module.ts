import { CheckLoginGuard } from './services/check-login.guard';
import { LoginComponent } from 'app/pages/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: []
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
