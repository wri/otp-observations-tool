import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { idb, isIndexedDbAvailable, STORES } from 'app/services/offline/indexed-db';

interface CachedResponse {
  url: string;
  body: any;
  storedAt: number;
}

/** First path segment of the API GET requests worth keeping for offline use */
const CACHEABLE_RESOURCES = [
  'countries', 'subcategories', 'categories', 'severities', 'laws', 'fmus', 'operators',
  'observers', 'governments', 'observation-reports', 'observation-documents'
];

/**
 * Stores the JSON:API responses of reference-data requests so the interceptor can answer
 * the same requests when the device is offline.
 *
 * Entries are keyed by the full request URL, so a request is only served offline when the
 * exact same request was made online (that is what OfflinePreparationService does). Two
 * exceptions, the "bundles": the laws of a country and the operators of a country with
 * their FMUs are also stored under a logical key, and the per-subcategory / per-operator
 * requests the form makes are derived from them. Without this, preparing a country would
 * mean one request per subcategory and one per operator.
 */
@Injectable()
export class ApiCacheService {
  private readonly apiBasePath = new URL(environment.apiUrl, location.origin).pathname.replace(/\/$/, '');

  get isAvailable(): boolean {
    return isIndexedDbAvailable();
  }

  isCacheable(url: string): boolean {
    const request = this.parse(url);
    if (!request) return false;

    if (request.path === 'users/current-user') return true;
    // A single user is only ever the logged in one, for the profile page
    if (request.resource === 'users' && /^\d+$/.test(request.id || '')) return true;
    if (!CACHEABLE_RESOURCES.includes(request.resource)) return false;
    // FMU geometries weigh megabytes each and the map cannot be used offline anyway
    if ((request.params.get('fields[fmus]') || '').includes('geojson')) return false;

    return true;
  }

  async store(url: string, body: any): Promise<void> {
    if (!this.isAvailable) return;

    try {
      const entry: CachedResponse = { url, body, storedAt: Date.now() };
      await idb.put(STORES.apiCache, url, entry);

      const bundleKey = this.bundleKey(url);
      if (bundleKey) {
        await idb.put(STORES.apiCache, bundleKey, entry);
      }
    } catch (err) {
      // Quota or a private window: the app keeps working online, just without offline data
      console.error('Could not cache the API response', err);
    }
  }

  /**
   * The cached body for a request, or null when nothing matches
   */
  async lookup(url: string): Promise<any | null> {
    if (!this.isAvailable) return null;

    try {
      const exact = await idb.get<CachedResponse>(STORES.apiCache, url);
      if (exact) return exact.body;

      return await this.derive(url);
    } catch (err) {
      console.error('Could not read the API cache', err);
      return null;
    }
  }

  /**
   * Forget who is logged in, and their profile. Called when the session ends so a logged out
   * user is not considered logged in while offline.
   */
  async clearSessionEntries(): Promise<void> {
    if (!this.isAvailable) return;

    try {
      const keys = await idb.keys(STORES.apiCache);
      await Promise.all(keys
        .filter((key) => (this.parse(key) || { resource: '' }).resource === 'users')
        .map((key) => idb.delete(STORES.apiCache, key)));
    } catch (err) {
      console.error('Could not clear the session from the API cache', err);
    }
  }

  /** Drop the responses stored before `maxAgeMs` ago, e.g. those of an organization no longer used */
  async prune(maxAgeMs: number): Promise<void> {
    if (!this.isAvailable) return;

    const limit = Date.now() - maxAgeMs;
    try {
      await idb.deleteWhere<CachedResponse>(STORES.apiCache, (entry) => !entry || !entry.storedAt || entry.storedAt < limit);
    } catch (err) {
      console.error('Could not prune the API cache', err);
    }
  }

  async clear(): Promise<void> {
    if (!this.isAvailable) return;
    await idb.clear(STORES.apiCache);
  }

  private parse(url: string): { path: string, resource: string, id: string, params: URLSearchParams } | null {
    let parsed: URL;
    try {
      parsed = new URL(url, location.origin);
    } catch {
      return null;
    }

    // The datastore joins the base URL and the resource with a slash of its own, which gives
    // "//operators" when the base URL already ends with one
    const pathname = parsed.pathname.replace(/\/{2,}/g, '/');
    if (!pathname.startsWith(this.apiBasePath + '/')) return null;

    const path = pathname.slice(this.apiBasePath.length + 1).replace(/\/$/, '');
    const [resource, id] = path.split('/');

    return { path, resource, id, params: parsed.searchParams };
  }

  private bundleKey(url: string): string | null {
    const request = this.parse(url);
    if (!request || request.id) return null;

    const country = request.params.get('filter[country]');
    const locale = request.params.get('locale') || '';
    if (!country) return null;

    if (request.resource === 'laws' && !request.params.get('filter[subcategory]')) {
      return `bundle:laws:${country}:${locale}`;
    }

    if (request.resource === 'operators' && (request.params.get('include') || '').split(',').includes('fmus')) {
      return `bundle:operators-fmus:${country}:${locale}`;
    }

    return null;
  }

  private async derive(url: string): Promise<any | null> {
    const request = this.parse(url);
    if (!request) return null;

    const locale = request.params.get('locale') || '';

    // The laws of a country for one subcategory, out of the laws of the whole country
    if (request.resource === 'laws' && !request.id) {
      const country = request.params.get('filter[country]');
      const subcategory = request.params.get('filter[subcategory]');
      if (!country || !subcategory) return null;

      const bundle = await idb.get<CachedResponse>(STORES.apiCache, `bundle:laws:${country}:${locale}`);
      if (!bundle) return null;

      const data = (bundle.body.data || []).filter((law) => {
        const linkage = law.relationships && law.relationships.subcategory && law.relationships.subcategory.data;
        return linkage && String(linkage.id) === subcategory;
      });

      // No `included`: the form asks for the laws alone, and handing it the subcategory
      // stubs of the bundle would let them overwrite the full subcategories in the datastore
      return { data, meta: bundle.body.meta };
    }

    // One operator with its FMUs, out of the operators of a country with their FMUs
    if (request.resource === 'operators' && request.id && (request.params.get('include') || '').split(',').includes('fmus')) {
      const keys = (await idb.keys(STORES.apiCache))
        .filter((key) => key.startsWith('bundle:operators-fmus:') && key.endsWith(`:${locale}`));

      for (const key of keys) {
        const bundle = await idb.get<CachedResponse>(STORES.apiCache, key);
        const operator = ((bundle && bundle.body.data) || []).find((o) => String(o.id) === request.id);
        if (!operator) continue;

        const linkage = operator.relationships && operator.relationships.fmus && operator.relationships.fmus.data || [];
        const fmuIds = linkage.map((f) => String(f.id));
        const included = (bundle.body.included || []).filter((i) => i.type === 'fmus' && fmuIds.includes(String(i.id)));

        return { data: operator, included };
      }
    }

    return null;
  }
}
