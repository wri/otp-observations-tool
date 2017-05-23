import { Directive, Input, TemplateRef, ContentChild } from '@angular/core';
import { TableColumnCellDirective } from 'app/shared/table/directives/column/column-cell.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'otp-table-column'
})
export class TableColumnDirective {

  @Input() name: string;
  @Input() prop: string;

  @Input()
  @ContentChild(TableColumnCellDirective, { read: TemplateRef })
  cellTemplate: TemplateRef<any>;

}
