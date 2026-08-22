import { Directive, Input } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'otp-filter',
  standalone: false
})
export class FilterDirective {
  // Name of the filter displayed in the UI
  @Input() name: string;
  // Attribute used to filter in the API
  @Input() prop: string;
  // Attribute to use to list the options
  // in the UI, if fetched from the API
  @Input() 'name-attr': string;
  // Attribute to use to append extra params to API query for async filters.
  // Aliased rather than declared as a quoted property: Ivy does not recognise
  // `@Input() 'extra-params'` as an input, so [extra-params] bindings fail with NG8002.
  // tslint:disable-next-line:no-input-rename
  @Input('extra-params') extraParams: string;
  // Filter values:
  //  - if object, the keys are the name of the options,
  //    the values the filter values
  //  - if string, the name of the model to fetch the
  //    values from
  //  - if array, the values to use
  @Input() values: string[] | string | object;
  // Whether the filter is mandatory
  @Input() required: boolean;
  // Default value for the filter
  @Input() default: string;
}
