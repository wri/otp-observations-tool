import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from './notification.service';

/** Renders NotificationService's toasts; placed once in the app shell */
@Component({
  selector: 'otp-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class NotificationsComponent implements OnDestroy {
  notifications: Notification[] = [];

  private subscription: Subscription;

  constructor(public service: NotificationService) {
    this.subscription = service.notifications$.subscribe((n) => this.notifications = n);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
