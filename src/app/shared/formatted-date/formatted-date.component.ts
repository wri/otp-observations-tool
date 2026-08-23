import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import flatpickr from 'flatpickr';
import { LOCALE } from '../datepicker/flatpickr-locales';

export const dateFormat = 'd/m/Y';

@Component({
  selector: 'otp-formatted-date',
  templateUrl: './formatted-date.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class FormattedDateComponent {

  @Input() date: Date | string;

  private isLocaleSet = false;

  get locale(): string {
    return localStorage.getItem('lang') || 'en';
  }

  get formattedDate(): string {
    if (!this.isLocaleSet) {
      const localeMethod = LOCALE[this.locale];
      if (localeMethod) {
        flatpickr.localize(localeMethod);
      }
      this.isLocaleSet = true;
    }

    return flatpickr.formatDate(
      typeof this.date === 'string' ? new Date(this.date) : this.date,
      dateFormat
    );
  }

}
