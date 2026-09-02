import { Directive, forwardRef } from '@angular/core';
import { Validator, NG_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- the selector deliberately mirrors Angular's own validator attributes
  selector: '[email][formControlName],[email][formControl],[email][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => EmailValidatorDirective), multi: true }
  ],
  standalone: false
})
export class EmailValidatorDirective implements Validator {

  validate(c: AbstractControl): ValidationErrors {
    if (c.value === null || c.value === undefined || !c.value.length) {
      return null;
    }

    // eslint-disable-next-line no-useless-escape -- escapes kept for readability of this regex
    if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(c.value)) {
      return null;
    }

    return { email: true };
  }

  registerOnValidatorChange(fn: () => void): void {}

}
