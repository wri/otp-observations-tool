import { Directive, Input, TemplateRef, ContentChild } from '@angular/core';
import { TableColumnCellDirective } from 'app/shared/table/directives/column/column-cell.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'otp-table-column'
})
export class TableColumnDirective {

  @Input() name: string;
  @Input() prop: string;
  @Input() include: boolean;
  @Input() sortable: boolean;
  @Input() hideable: boolean = true;
  @Input() hidden: boolean;

  @Input()
  @ContentChild(TableColumnCellDirective, { read: TemplateRef, static: true })
  cellTemplate: TemplateRef<any>;

}
