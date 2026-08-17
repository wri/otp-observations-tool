import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedUiModule } from 'app/shared/shared-ui.module';
import { ProfileComponent } from 'app/pages/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent
  }
];

@NgModule({
  imports: [
    SharedUiModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ProfileComponent
  ]
})
export class ProfileModule { }
