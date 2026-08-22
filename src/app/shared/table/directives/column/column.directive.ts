import { Directive, Input, TemplateRef, ContentChild } from '@angular/core';
import { TableColumnCellDirective } from 'app/shared/table/directives/column/column-cell.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'otp-table-column',
  standalone: false
})
export class TableColumnDirective {

  @Input() name: string;
  @Input() prop: string;
  @Input() include: boolean;

  /**
   * Sparse fieldset the column needs, keyed by JSON:API resource *type* (not by the
   * relationship name): `[fields]="{ operators: ['name'] }"` for `prop="operator.name"`.
   * The type can't be derived from the prop, angular2-jsonapi's relationship metadata
   * doesn't record the target model.
   */
  @Input() fields: { [type: string]: string | string[] };
  @Input() sortable: boolean;
  @Input() hideable: boolean = true;
  @Input() hidden: boolean;

  // The @Input() that used to sit here was vestigial - nothing ever bound [cellTemplate],
  // it is only ever populated by this content query. Ivy rejects the combination (NG1006).
  @ContentChild(TableColumnCellDirective, { read: TemplateRef, static: true })
  cellTemplate: TemplateRef<any>;

}
