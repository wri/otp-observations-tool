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

export interface ConfirmOptions {
  params?: object;
  /** Translation key of the accepting button */
  confirmLabel?: string;
  /** Translation key of the refusing button */
  cancelLabel?: string;
  /** Style the accepting button as destructive */
  danger?: boolean;
}

export interface Confirmation extends Required<Omit<ConfirmOptions, 'params'>> {
  message: string;
  params?: object;
  resolve: (accepted: boolean) => void;
}

/** Errors stay longer: they are often longer and need reading */
const AUTO_DISMISS_MS: Record<NotificationType, number> = { success: 6000, info: 6000, error: 15000 };
const AFTER_RELOAD_KEY = 'otp-notification-after-reload';

/**
 * In-app replacement for window.alert/confirm: toasts that don't block the page, and a
 * confirmation dialog answered through a promise. Rendered by NotificationsComponent.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications$ = new BehaviorSubject<Notification[]>([]);
  readonly confirmation$ = new BehaviorSubject<Confirmation>(null);

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

  /** Resolves true when the user accepts, false when they cancel or press Esc */
  confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
    // Only one question at a time: an unanswered one counts as refused
    this.confirmation$.value?.resolve(false);

    return new Promise((resolve) => {
      this.confirmation$.next({
        message,
        params: options.params,
        confirmLabel: options.confirmLabel ?? 'Yes',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        danger: options.danger ?? false,
        resolve: (accepted) => {
          this.confirmation$.next(null);
          resolve(accepted);
        }
      });
    });
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
