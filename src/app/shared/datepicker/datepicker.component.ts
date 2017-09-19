import { Component, forwardRef, Input, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { DateModel } from 'ng2-datepicker';
import { format } from 'date-fns';
import { IDatePickerOptions, IDateModel } from 'ng2-datepicker/lib-dist/ng2-datepicker.component';

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
export class DatepickerComponent implements Validator, ControlValueAccessor {

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
  datepickerInputEvents = new EventEmitter<{ type: string, data: Date }>();
  private _date: string; // Value of the internal native model
  private _dateModel: DateModel; // Value of the internal custom modal
  private _required = false; // Is the input required?
  private _disabled = false; // Is the input disabled?
  private validatorCallback: () => void;
  private modelCallback: (date: Date) => void;
  private touchCallback: (date: Date) => void;

  get nativeValue(): string {
    return this._date;
  }

  set nativeValue(value: string) {
    if (/^\d{4}\-\d{2}\-\d{2}$/.test(value)) {
      const values = value.split('-');
      this.date = new Date(Date.UTC(+values[0], +values[1] - 1, +values[2]));
    } else {
      this.date = null;
    }

    this._date = value;
    this.propagateChange();
  }

  get customValue (): DateModel {
    return this._dateModel;
  }

  set customValue(value: DateModel) {
    this._dateModel = value;
    this.date = new Date(Date.UTC(+value.year, +value.month, +value.day));
    this.propagateChange();
  }

  writeValue(date: Date): void {
    if (date === null || date === undefined) {
      this.date = null;
      this._date = null;

      // Hack to remove the date from the UI
      if (this.customValue && this.customValue.formatted) {
        this.customValue.formatted = '';
      }
    } else if (typeof date === 'object') {
      this.date = date;

      // We also update the native input
      this._date = format(date, 'YYYY-MM-DD');

      // We set the initial date for the custom one
      const dateModel = new DateModel(<IDateModel>{ day: format(date, 'DD'), month: format(date, 'MM'), year: format(date, 'YYYY') });
      this.datepickerInputEvents.emit({ type: 'setDate', data: date });
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
