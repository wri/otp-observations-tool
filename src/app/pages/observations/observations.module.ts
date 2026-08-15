import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { SharedUiModule } from 'app/shared/shared-ui.module';
import { ObservationsComponent } from 'app/pages/observations/observations.component';
import { ObservationListComponent } from 'app/pages/observations/observation-list.component';
import { ObservationDetailComponent } from 'app/pages/observations/observation-detail.component';

// Kept identical to the child routes previously declared in AppRoutingModule.
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
        component: ObservationDetailComponent
      },
      {
        path: 'edit/:id',
        component: ObservationDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    SharedUiModule,
    LeafletModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ObservationsComponent,
    ObservationListComponent,
    ObservationDetailComponent
  ]
})
export class ObservationsModule { }
