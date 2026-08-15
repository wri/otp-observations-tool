import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedUiModule } from 'app/shared/shared-ui.module';
import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { ObservationListComponent } from 'app/pages/observations/observation-list.component';

// Paths are unchanged from the original eager routing table. The detail form is loaded on demand
// (see ObservationDetailModule) so opening the list does not pull in leaflet/proj4/exif-js.
const routes: Routes = [
  {
    path: '',
    component: ObservationsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'operators'
      },
      {
        path: '',
        component: ObservationListComponent
      },
      {
        path: 'new',
        loadChildren: () =>
          import('app/pages/observations/observation-detail.module').then(m => m.ObservationDetailModule)
      },
      {
        path: 'edit/:id',
        loadChildren: () =>
          import('app/pages/observations/observation-detail.module').then(m => m.ObservationDetailModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    SharedUiModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ObservationsComponent,
    ObservationListComponent
  ]
})
export class ObservationsModule { }
