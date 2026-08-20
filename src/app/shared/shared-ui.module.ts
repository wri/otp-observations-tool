import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';

import { SharedModule } from 'app/shared/shared.module';

import { LoaderComponent } from 'app/shared/loader/loader.component';
import { IconComponent } from 'app/shared/icons/icon.component';
import { ActionBarComponent } from 'app/shared/action-bar/action-bar.component';
import { TagComponent } from 'app/shared/tag/tag.component';
import { TabsComponent } from 'app/shared/tabs/tabs.component';
import { ModalComponent } from 'app/shared/modal/modal.component';
import { TableComponent } from 'app/shared/table/table.component';
import { TableColumnDirective } from 'app/shared/table/directives/column/column.directive';
import { TableColumnCellDirective } from 'app/shared/table/directives/column/column-cell.directive';
import { FiltersComponent } from 'app/shared/filters/filters.component';
import { FilterDirective } from 'app/shared/filters/directives/filter.directive';
import { DatepickerComponent } from 'app/shared/datepicker/datepicker.component';
import { FormattedDateComponent } from 'app/shared/formatted-date/formatted-date.component';
import { UploadFileComponent } from 'app/shared/upload-file/upload-file.component';
import { Base64FileInputDirective } from 'app/directives/base64-file-input.directive';
import { GovernmentDetailComponent } from 'app/pages/fields/governments/government-detail.component';
import { OperatorDetailComponent } from 'app/pages/fields/operators/operator-detail.component';

/**
 * Shared UI used only by lazily loaded feature modules, so it stays out of the initial bundle
 * and lands in a chunk shared between them.
 *
 * GovernmentDetailComponent and OperatorDetailComponent live here rather than in FieldsModule
 * because observation-detail embeds them in its "New Gov"/"New Producer" modals, so both the
 * fields and observations features need them.
 */
@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    NgxBootstrapMultiselectModule
  ],
  declarations: [
    LoaderComponent,
    IconComponent,
    ActionBarComponent,
    TagComponent,
    TabsComponent,
    ModalComponent,
    TableComponent,
    TableColumnDirective,
    TableColumnCellDirective,
    FiltersComponent,
    FilterDirective,
    DatepickerComponent,
    FormattedDateComponent,
    UploadFileComponent,
    Base64FileInputDirective,
    GovernmentDetailComponent,
    OperatorDetailComponent
  ],
  exports: [
    SharedModule,
    NgxBootstrapMultiselectModule,
    LoaderComponent,
    IconComponent,
    ActionBarComponent,
    TagComponent,
    TabsComponent,
    ModalComponent,
    TableComponent,
    TableColumnDirective,
    TableColumnCellDirective,
    FiltersComponent,
    FilterDirective,
    DatepickerComponent,
    FormattedDateComponent,
    UploadFileComponent,
    Base64FileInputDirective,
    GovernmentDetailComponent,
    OperatorDetailComponent
  ]
})
export class SharedUiModule { }
