import { Directive, forwardRef } from '@angular/core';
import { Validator, NG_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[number][formControlName],[number][formControl],[number][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NumberValidatorDirective), multi: true }
  ]
})
export class NumberValidatorDirective implements Validator {

  validate(c: AbstractControl): ValidationErrors {
    if (/^-?[0-9]*(\.[0-9]+)?$/.test(c.value)) {
      return null;
    }

    return { number: true };
  }

  registerOnValidatorChange(fn: () => void): void {}

}
