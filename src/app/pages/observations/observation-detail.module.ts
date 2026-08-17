import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { SharedUiModule } from 'app/shared/shared-ui.module';
import { ObservationDetailComponent } from 'app/pages/observations/observation-detail.component';

// Split out of ObservationsModule so the observation *list* does not have to download the
// detail form and its map stack (leaflet, proj4, exif-js) — together the largest chunk in the app.
// Mounted at '' because both the 'new' and 'edit/:id' routes load this module.
const routes: Routes = [
  {
    path: '',
    component: ObservationDetailComponent
  }
];

@NgModule({
  imports: [
    SharedUiModule,
    LeafletModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ObservationDetailComponent
  ]
})
export class ObservationDetailModule { }
