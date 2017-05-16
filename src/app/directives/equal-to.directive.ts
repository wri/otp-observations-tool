import { Directive, forwardRef, Input } from '@angular/core';
import { Validator, NG_VALIDATORS, AbstractControl, ValidationErrors, NgModel } from '@angular/forms';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[equalTo][formControlName],[equalTo][formControl],[equalTo][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => EqualToValidatorDirective), multi: true }
  ]
})
export class EqualToValidatorDirective implements Validator {

  @Input() equalTo: NgModel;
  private hasSubscribed = false;

  validate(c: AbstractControl): ValidationErrors {
    const value = c.value;
    const otherValue = this.equalTo.value;

    if (!this.hasSubscribed) {
      this.equalTo.valueChanges.subscribe(() => c.updateValueAndValidity());
    }

    if (value === otherValue) {
      return null;
    }

    return { equalTo: true };
  }

  registerOnValidatorChange(fn: () => void): void {}

}
