import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, Injector, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Confirmation, Notification, NotificationService } from './notification.service';

/** Renders NotificationService's toasts and confirmation dialog; placed once in the app shell */
@Component({
  selector: 'otp-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class NotificationsComponent implements OnDestroy {
  @ViewChild('dialog', { static: true }) dialog: ElementRef<HTMLDialogElement>;

  notifications: Notification[] = [];
  confirmation: Confirmation = null;

  private subscriptions = new Subscription();

  constructor(public service: NotificationService, private injector: Injector) {
    this.subscriptions.add(service.notifications$.subscribe((n) => this.notifications = n));
    this.subscriptions.add(service.confirmation$.subscribe((c) => {
      this.confirmation = c;
      const dialog = this.dialog?.nativeElement;
      if (!dialog) return;
      if (!c && dialog.open) dialog.close();
      // Once the buttons are rendered, so showModal() focuses the one marked autofocus
      if (c) afterNextRender(() => !dialog.open && dialog.showModal(), { injector: this.injector });
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  answer(accepted: boolean): void {
    this.confirmation?.resolve(accepted);
  }

  /** Esc or any other way of closing the dialog without a button counts as cancelling */
  onDialogClose(): void {
    this.answer(false);
  }
}
