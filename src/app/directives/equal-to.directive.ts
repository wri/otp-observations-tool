import { Directive, forwardRef, Input } from '@angular/core';
import { Validator, NG_VALIDATORS, AbstractControl, ValidationErrors, NgModel } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- the selector deliberately mirrors Angular's own validator attributes
  selector: '[equalTo][formControlName],[equalTo][formControl],[equalTo][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => EqualToValidatorDirective), multi: true }
  ],
  standalone: false
})
export class EqualToValidatorDirective implements Validator {

  @Input() equalTo: NgModel;
  private hasSubscribed = false;

  validate(c: AbstractControl): ValidationErrors {
    const value = c.value;
    const otherValue = this.equalTo.value;

    if (!this.hasSubscribed) {
      this.equalTo.valueChanges.subscribe(() => c.updateValueAndValidity());
      this.hasSubscribed = true;
    }

    if (value === otherValue) {
      return null;
    }

    return { equalTo: true };
  }

  registerOnValidatorChange(fn: () => void): void { }

}
