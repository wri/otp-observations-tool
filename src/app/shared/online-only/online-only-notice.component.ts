import { Component, ChangeDetectionStrategy } from '@angular/core';

/** What an online-only page shows instead of itself while offline */
@Component({
  selector: 'otp-online-only-notice',
  template: `
    <div class="callout warning" data-test-id="online-only-notice">
      <p><strong>{{ 'offline.requiresConnection' | translate }}</strong></p>
      <p>{{ 'offline.requiresConnectionHint' | translate }}</p>
      <p><a routerLink="/private/observations">{{ 'Observations' | translate }}</a></p>
    </div>
  `,
  styles: [':host { display: block; margin: 20px 0; }'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class OnlineOnlyNoticeComponent {}
