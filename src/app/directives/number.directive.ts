import { Directive, forwardRef } from '@angular/core';
import { Validator, NG_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- the selector deliberately mirrors Angular's own validator attributes
  selector: '[number][formControlName],[number][formControl],[number][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NumberValidatorDirective), multi: true }
  ],
  standalone: false
})
export class NumberValidatorDirective implements Validator {

  validate(c: AbstractControl): ValidationErrors {
    if (c.value === null || c.value === undefined || /^-?[0-9]*(\.[0-9]+)?$/.test(c.value)) {
      return null;
    }

    return { number: true };
  }

  registerOnValidatorChange(fn: () => void): void {}

}
