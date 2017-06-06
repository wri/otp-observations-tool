import { Directive, Input } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'otp-filter'
})
export class FilterDirective {
  @Input() name: string;
  @Input() prop: string;
  @Input() values: string[];
  @Input() required: boolean;
  @Input() default: string;
}
