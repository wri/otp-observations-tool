import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info';

/** `message` is a translation key or already readable text (e.g. an API error) */
export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  params?: object;
}

/** Errors stay longer: they are often longer and need reading */
const AUTO_DISMISS_MS: Record<NotificationType, number> = { success: 6000, info: 6000, error: 15000 };
const AFTER_RELOAD_KEY = 'otp-notification-after-reload';

/** In-app replacement for window.alert: toasts that don't block the page. Rendered by NotificationsComponent. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications$ = new BehaviorSubject<Notification[]>([]);

  private nextId = 1;

  constructor(private ngZone: NgZone) {
    this.showPendingFromReload();
  }

  success(message: string, params?: object): void {
    this.show('success', message, params);
  }

  error(message: string, params?: object): void {
    this.show('error', message, params);
  }

  info(message: string, params?: object): void {
    this.show('info', message, params);
  }

  /** For a success message followed by location.reload() */
  successAfterReload(message: string, params?: object): void {
    try {
      sessionStorage.setItem(AFTER_RELOAD_KEY, JSON.stringify({ message, params }));
    } catch {
      // Storage unavailable: the message is lost, the action itself still succeeded
    }
  }

  dismiss(id: number): void {
    this.notifications$.next(this.notifications$.value.filter((n) => n.id !== id));
  }

  private show(type: NotificationType, message: string, params?: object): void {
    const id = this.nextId++;
    this.notifications$.next([...this.notifications$.value, { id, type, message, params }]);

    // Outside Angular so a pending toast doesn't keep the app "unstable"
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.ngZone.run(() => this.dismiss(id)), AUTO_DISMISS_MS[type]);
    });
  }

  private showPendingFromReload(): void {
    try {
      const pending = sessionStorage.getItem(AFTER_RELOAD_KEY);
      if (!pending) return;
      sessionStorage.removeItem(AFTER_RELOAD_KEY);
      const { message, params } = JSON.parse(pending);
      this.success(message, params);
    } catch {
      // Unreadable: nothing to show
    }
  }
}
