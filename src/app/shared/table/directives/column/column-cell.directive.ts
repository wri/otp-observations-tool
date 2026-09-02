import { Directive, TemplateRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- the selector deliberately mirrors Angular's own validator attributes
  selector: '[table-cell-template]',
  standalone: false
})
export class TableColumnCellDirective {
  constructor(public template: TemplateRef<any>) {}
}
