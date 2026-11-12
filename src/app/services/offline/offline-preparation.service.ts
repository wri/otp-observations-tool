import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { CountriesService } from 'app/services/countries.service';
import { SubcategoriesService } from 'app/services/subcategories.service';
import { LawsService } from 'app/services/laws.service';
import { FmusService } from 'app/services/fmus.service';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { GovernmentsService } from 'app/services/governments.service';
import { ObservationReportsService } from 'app/services/observation-reports.service';
import { ObservationDocumentsService } from 'app/services/observation-documents.service';
import { UsersService } from 'app/services/users.service';
import { ApiCacheService } from 'app/services/offline/api-cache.service';
import { ConnectivityService } from 'app/services/offline/connectivity.service';
import { idb, STORES } from 'app/services/offline/indexed-db';
import { environment } from 'environments/environment';

/** A successful download is redone after this long */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** After a failed background run, triggers are ignored for this long (flaky connections) */
const RETRY_AFTER_FAILURE_MS = 5 * 60 * 1000;
/** Cached responses not refreshed for this long are deleted after a successful run */
const CACHE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export interface PreparationState {
  running: boolean;
  done: number;
  total: number;
  /** Number of requests that failed during the last run */
  failures: number;
  preparedAt: Date | null;
  /** Whether preparedAt was read from storage yet, so "never prepared" can be told apart */
  loaded: boolean;
}

interface PreparationMeta {
  preparedAt: string;
  locale: string;
}

/**
 * Downloads everything the observation form needs for the observer's countries, so the
 * form can be used offline. Runs on its own (see prepareIfStale) and from the "Update now" link.
 *
 * It only makes requests, through the same services and with the same parameters as the
 * form does: the interceptor caches them by URL, and the form's own requests are then
 * answered from that cache. Two requests per country are "bundles" the ApiCacheService
 * derives the per-subcategory laws and per-operator FMUs from, see there.
 */
@Injectable()
export class OfflinePreparationService {
  private stateSubject = new BehaviorSubject<PreparationState>({
    running: false, done: 0, total: 0, failures: 0, preparedAt: null, loaded: false
  });
  private lastFailedAt = 0;
  private autoRun: Promise<void> = null;

  get state$() {
    return this.stateSubject.asObservable();
  }

  get isAvailable(): boolean {
    return this.apiCache.isAvailable;
  }

  constructor(
    private authService: AuthService,
    private countriesService: CountriesService,
    private subcategoriesService: SubcategoriesService,
    private lawsService: LawsService,
    private fmusService: FmusService,
    private operatorsService: OperatorsService,
    private observersService: ObserversService,
    private governmentsService: GovernmentsService,
    private observationReportsService: ObservationReportsService,
    private observationDocumentsService: ObservationDocumentsService,
    private usersService: UsersService,
    private apiCache: ApiCacheService,
    private connectivity: ConnectivityService
  ) {}

  /** Restore the date of the last run for the current user and observer */
  async loadState(): Promise<void> {
    if (!this.isAvailable) return;

    const meta = await this.readMeta(this.metaKey);
    this.patchState({ preparedAt: meta ? new Date(meta.preparedAt) : null, loaded: true });
  }

  /**
   * Download in the background, unless the data on the device is recent enough, the user
   * cannot create observations for the current organization, or we should not use the
   * network (offline, data saver).
   */
  prepareIfStale(): Promise<void> {
    if (!this.autoRun) {
      this.autoRun = this.runIfStale().finally(() => this.autoRun = null);
    }
    return this.autoRun;
  }

  private async runIfStale(): Promise<void> {
    if (!environment.autoPrepareOffline || !this.isAvailable) return;
    if (!this.connectivity.isOnline || this.isDataSaverOn) return;
    if (this.stateSubject.value.running) return;
    if (Date.now() - this.lastFailedAt < RETRY_AFTER_FAILURE_MS) return;

    const { userId, userObserverId, managedObserverIds } = this.authService;
    if (!userId || !userObserverId || !managedObserverIds.includes(userObserverId)) return;

    const meta = await this.readMeta(this.metaKey);
    const isFresh = meta
      && meta.locale === this.locale
      && Date.now() - Date.parse(meta.preparedAt) < MAX_AGE_MS;
    if (isFresh) return;

    await this.prepare({ background: true });
  }

  /**
   * Download everything. In the background fewer requests run at once, so the page the
   * user is looking at keeps priority.
   */
  async prepare(options: { background?: boolean } = {}): Promise<PreparationState> {
    if (this.stateSubject.value.running) return this.stateSubject.value;

    // Captured now: the user may switch organization while this runs
    const observerId = this.authService.userObserverId;
    const metaKey = this.metaKey;
    const locale = this.locale;
    const steps: (() => Promise<unknown>)[] = [];
    let failures = 0;

    this.patchState({ running: true, done: 0, total: 0, failures: 0 });

    const run = async (step: () => Promise<unknown>) => {
      try {
        await step();
      } catch (err) {
        failures++;
        console.error('Offline preparation request failed', err);
      }
      this.patchState({ done: this.stateSubject.value.done + 1, failures });
    };

    try {
      // Everything the form loads regardless of the country, same parameters as the form
      steps.push(
        () => this.countriesService.getAll({ sort: 'name', fields: { countries: 'name,iso' } }),
        () => this.countriesService.getAll({ include: 'governments', sort: 'name', fields: { countries: 'name,iso,governments' } }),
        () => this.subcategoriesService.getByType('operator', { include: 'severities,category' }),
        () => this.subcategoriesService.getByType('government', { include: 'severities,category' }),
        () => this.operatorsService.getAll({ filter: { slug: 'unknown' } }),
        () => this.observersService.getAll({ sort: 'name', fields: { observers: 'name' } }),
        // The profile page, same parameters as ProfileComponent
        () => this.usersService.getById(this.authService.userId, { include: 'country,observer' })
      );

      // The observer's countries decide what else to download
      const observer = await this.observersService.getById(observerId, {
        include: 'countries',
        fields: { countries: 'id' }
      });
      const countryIds = (observer.countries || []).map((c) => c.id);

      countryIds.forEach((country) => {
        steps.push(
          () => this.fmusService.getAll({ sort: 'name', filter: { country }, fields: { fmus: 'name' } }),
          () => this.operatorsService.getAll({ sort: 'name', filter: { country }, fields: { operators: 'name' } }),
          () => this.governmentsService.getAll({ filter: { country } }),
          // Bundles. The subcategory is included so the response carries the linkage
          // the per-subcategory derivation filters on (the API omits it otherwise).
          () => this.lawsService.getAll({ filter: { country }, include: 'subcategory', fields: { subcategories: 'id' } }),
          () => this.operatorsService.getAll({ sort: 'name', filter: { country }, include: 'fmus', fields: { operators: 'name,fmus', fmus: 'name' } })
        );
      });

      // The observer's reports, and the documents of each one so they can be reused as evidence
      const reports = await this.observationReportsService.getAll({
        sort: 'title',
        filter: { observer_id: observerId },
        include: 'observers',
        fields: {
          'observation-reports': 'title,attachment,publication-date,observers',
          observers: 'name'
        }
      });
      reports.forEach((report) => {
        steps.push(() => this.observationDocumentsService.getAll({ filter: { 'observation-report-id': report.id } }));
      });

      // The two requests above count too
      this.patchState({ total: steps.length + 2, done: 2 });

      // A few at a time: the list can be long and the devices in the field are small
      const queue = steps.slice();
      const workers = Array.from({ length: options.background ? 2 : 4 }, async () => {
        while (queue.length) {
          await run(queue.shift());
        }
      });
      await Promise.all(workers);

      // Only a complete download counts, otherwise the next trigger would skip the retry
      if (!failures) {
        const preparedAt = new Date();
        await idb.put<PreparationMeta>(STORES.meta, metaKey, { preparedAt: preparedAt.toISOString(), locale });
        this.patchState({ preparedAt });
        await this.apiCache.prune(CACHE_RETENTION_MS);
      }
    } catch (err) {
      failures++;
      console.error('Offline preparation failed', err);
    } finally {
      this.lastFailedAt = failures ? Date.now() : 0;
      this.patchState({ running: false, failures });
    }

    return this.stateSubject.value;
  }

  private get metaKey(): string {
    return `offline-prepared:${this.authService.userId}:${this.authService.userObserverId}`;
  }

  private get locale(): string {
    return localStorage.getItem('lang') || 'en';
  }

  /** Chrome on Android exposes the user's data saver setting; other browsers don't */
  private get isDataSaverOn(): boolean {
    const connection = (navigator as any).connection;
    return !!(connection && connection.saveData);
  }

  private async readMeta(key: string): Promise<PreparationMeta | null> {
    if (!this.isAvailable) return null;

    try {
      return (await idb.get<PreparationMeta>(STORES.meta, key)) || null;
    } catch (err) {
      console.error('Could not read the offline preparation state', err);
      return null;
    }
  }

  private patchState(patch: Partial<PreparationState>) {
    this.stateSubject.next({ ...this.stateSubject.value, ...patch });
  }
}
