import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  /** Translation key or already readable text */
  message: string;
  params?: object;
  resolve: (accepted: boolean) => void;
}

/** In-app replacement for window.confirm, answered through a promise. Rendered by ConfirmDialogComponent. */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly confirmation$ = new BehaviorSubject<Confirmation>(null);

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
}
