import { Component, ChangeDetectionStrategy, OnDestroy, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { AuthService } from 'app/services/auth.service';
import { ConnectivityService } from 'app/services/offline/connectivity.service';
import { OutboxService } from 'app/services/offline/outbox.service';
import { ObservationSubmissionService } from 'app/services/offline/observation-submission.service';
import { OfflinePreparationService } from 'app/services/offline/offline-preparation.service';

/** Delay before a background download, so it doesn't compete with the page being opened */
const PREPARATION_DELAY_MS = 5000;

/**
 * Banner under the header telling the user they are offline, or that observations created
 * on this device are waiting to be sent. Also where the background work is triggered, on
 * login and when the connection comes back: sending the outbox, then refreshing the data
 * needed offline when it is stale.
 */
@Component({
  selector: 'otp-offline-status',
  templateUrl: './offline-status.component.html',
  styleUrls: ['./offline-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class OfflineStatusComponent implements OnDestroy {
  isLogged = false;
  isOnline = true;
  isSyncing = false;
  queued = 0;
  failed = 0;
  /** The offline data was never downloaded for this user and organization */
  notPrepared = false;

  private subscriptions = new Subscription();
  private preparationTimer: ReturnType<typeof setTimeout> = null;

  constructor(
    private authService: AuthService,
    private connectivity: ConnectivityService,
    private outboxService: OutboxService,
    private submissionService: ObservationSubmissionService,
    private preparationService: OfflinePreparationService,
    private translateService: TranslateService,
    private ngZone: NgZone
  ) {
    this.subscriptions.add(this.connectivity.onlineChanges.subscribe((online) => this.isOnline = online));
    this.subscriptions.add(this.submissionService.syncing$.subscribe((syncing) => this.isSyncing = syncing));
    this.subscriptions.add(this.preparationService.state$.subscribe((state) => {
      this.notPrepared = state.loaded && !state.preparedAt && !state.running;
    }));

    // Emits on every guarded navigation, not only on login: the work below dedupes itself
    this.subscriptions.add(this.authService.loginStatus.subscribe((isLogged) => {
      this.isLogged = isLogged;
      if (isLogged) {
        this.watchOutbox();
        this.preparationService.loadState();
        this.sync();
        this.schedulePreparation();
        this.requestPersistentStorage();
      }
    }));

    // Back online: send what piled up while we were not, then catch up on the data
    this.subscriptions.add(
      this.connectivity.onlineChanges.pipe(skip(1), filter((online) => online)).subscribe(() => {
        this.sync();
        this.schedulePreparation();
      })
    );

    // The cached responses are per language, so a new language needs a new download
    this.subscriptions.add(this.translateService.onLangChange.subscribe(() => this.schedulePreparation()));
  }

  ngOnDestroy(): void {
    clearTimeout(this.preparationTimer);
    this.subscriptions.unsubscribe();
  }

  get hasPending(): boolean {
    return this.queued > 0 || this.failed > 0;
  }

  sync(): Promise<void> {
    if (!this.isLogged || !this.isOnline) return Promise.resolve();
    return this.submissionService.syncAll(this.authService.userId);
  }

  /**
   * Refresh the offline data shortly, after the outbox was sent. The timer runs outside
   * Angular so it doesn't hold the app "unstable" (the service worker registration waits
   * for stability).
   */
  private schedulePreparation(): void {
    if (!this.isLogged) return;

    clearTimeout(this.preparationTimer);
    this.ngZone.runOutsideAngular(() => {
      this.preparationTimer = setTimeout(() => this.ngZone.run(async () => {
        await this.sync();
        await this.preparationService.prepareIfStale();
      }), PREPARATION_DELAY_MS);
    });
  }

  private outboxSubscription: Subscription = null;

  private watchOutbox(): void {
    if (this.outboxSubscription) return;

    this.outboxSubscription = this.outboxService.entries$.subscribe((entries) => {
      const mine = entries.filter((e) => e.userId === this.authService.userId);
      this.queued = mine.filter((e) => ['queued', 'syncing'].includes(e.status)).length;
      this.failed = mine.filter((e) => e.status === 'failed').length;
    });
    this.subscriptions.add(this.outboxSubscription);
  }

  /**
   * Ask the browser not to evict our storage under pressure: the outbox may be the only
   * copy of days of field work.
   */
  private requestPersistentStorage(): void {
    try {
      if (navigator.storage && typeof navigator.storage.persist === 'function') {
        navigator.storage.persist().catch(() => undefined);
      }
    } catch {
      // Not supported, nothing to do
    }
  }
}
