import { Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * Tracks whether the device has a network connection.
 *
 * `navigator.onLine` only knows about the network interface, not whether the API is actually
 * reachable, so callers that talk to the API still have to handle failed requests. The
 * interceptor does: a request that never reached the API is treated the same as being offline.
 */
@Injectable()
export class ConnectivityService {
  private online$ = new BehaviorSubject<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);

  constructor(ngZone: NgZone) {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => ngZone.run(() => this.online$.next(true)));
    window.addEventListener('offline', () => ngZone.run(() => this.online$.next(false)));
  }

  get isOnline(): boolean {
    return this.online$.value;
  }

  /** Emits on every change of connectivity, starting with the current state */
  get onlineChanges(): Observable<boolean> {
    return this.online$.pipe(distinctUntilChanged());
  }
}

/**
 * Whether a failed request never reached the API: status 0 from the browser, or the 504 the
 * Angular service worker answers with when its own fetch fails.
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status === 504);
}
