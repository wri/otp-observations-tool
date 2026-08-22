import { Directive, TemplateRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[table-cell-template]',
  standalone: false
})
export class TableColumnCellDirective {
  constructor(public template: TemplateRef<any>) {}
}
