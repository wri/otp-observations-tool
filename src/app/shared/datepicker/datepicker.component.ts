import { Component, forwardRef, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import flatpickr from 'flatpickr';
import Locale from 'flatpickr/dist/l10n';
import { dateFormat } from '../formatted-date/formatted-date.component';

const REQUIRED_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => DatepickerComponent),
  multi: true
};

const VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatepickerComponent),
  multi: true
};

@Component({
  selector: 'otp-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [REQUIRED_VALIDATOR, VALUE_ACCESSOR]
})
export class DatepickerComponent implements Validator, ControlValueAccessor, AfterViewInit {

  @Input() id: string;
  @Input() name: string;

  @Input()
  get disabled(): boolean|string { return this._disabled; }

  set disabled(value: boolean|string) {
    this._disabled = value != null && value !== false && `${value}` !== 'false';
  }

  @Input()
  get required(): boolean|string { return this._required; }

  set required(value: boolean|string) {
    this._required = value != null && value !== false && `${value}` !== 'false';
  }

  date: Date; // Value of the external model
  private _required = false; // Is the input required?
  private _disabled = false; // Is the input disabled?
  private validatorCallback: () => void;
  private modelCallback: (date: Date) => void;
  private touchCallback: (date: Date) => void;
  private flatpickr;

  ngAfterViewInit(): void {
    this.flatpickr = flatpickr(`#${this.id}`, {
      locale: Locale[<any>(localStorage.getItem('lang') || 'en')],
      dateFormat: dateFormat,
      defaultDate: this.date,
      onChange: ([ date ]) => {
        this.date = date;
        this.propagateChange();
      }
    });
  }

  writeValue(date: Date | string): void {
    if (date === null || date === undefined) {
      this.date = null;
    } else if (typeof date === 'object') {
      this.date = date;
    } else if (typeof date === 'string') {
      this.date = new Date(date);
    }

    if (this.flatpickr) {
      this.flatpickr.setDate(this.date);
    }
  }

  registerOnChange(fn: any): void {
    this.modelCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  validate(c: AbstractControl): ValidationErrors {
    if (this.date || !this.required) {
      return null;
    }

    return {
      required: true
    };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validatorCallback = fn;
  }

  propagateChange() {
    if (this.validatorCallback) {
      this.validatorCallback();
    }

    if (this.modelCallback) {
      this.modelCallback(this.date);
    }

    if (this.touchCallback) {
      this.touchCallback(this.date);
    }
  }

}
