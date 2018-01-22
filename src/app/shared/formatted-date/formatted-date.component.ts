import { Component, Input } from '@angular/core';
import flatpickr from 'flatpickr';
import Locale from 'flatpickr/dist/l10n';

export const dateFormat = 'j M Y';

@Component({
  selector: 'otp-formatted-date',
  templateUrl: './formatted-date.component.html',
})
export class FormattedDateComponent {

  @Input() date: Date|string;

  private isLocaleSet = false;

  get locale(): string {
    return localStorage.getItem('lang') || 'en';
  }

  get formattedDate(): string {
    if (!this.isLocaleSet) {
      const localeMethod = Locale[<any>this.locale];
      flatpickr.localize(localeMethod);
      this.isLocaleSet = true;
    }

    return flatpickr.formatDate(
      typeof this.date === 'string' ? new Date(this.date) : this.date,
      dateFormat
    );
  }

}
