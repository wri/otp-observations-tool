/**
 * Minimal promise wrapper around the IndexedDB stores the offline features use.
 *
 * Every store is keyed by a string (the key is passed explicitly, not read from the value).
 * localStorage is not an option here: it is capped around 5MB and the drafts carry base64
 * attachments.
 */

const DB_NAME = 'otp-observations-tool';
const DB_VERSION = 1;

export const STORES = {
  /** Cached API GET responses, keyed by request URL */
  apiCache: 'api-cache',
  /** Observations created on the device and not yet accepted by the API */
  outbox: 'outbox',
  /** Small bookkeeping values (last "prepare for offline" run, ...) */
  meta: 'meta'
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> = null;

export function isIndexedDbAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (!isIndexedDbAvailable()) {
        reject(new Error('IndexedDB is not available'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        Object.values(STORES).forEach((name) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name);
          }
        });
      };

      request.onsuccess = () => {
        const db = request.result;
        // Should the browser drop the database behind our back, the next call reopens it
        db.onclose = () => dbPromise = null;
        db.onversionchange = () => { db.close(); dbPromise = null; };
        resolve(db);
      };

      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  action: (objectStore: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  const transaction = db.transaction(store, mode);
  const result = requestToPromise(action(transaction.objectStore(store)));

  return new Promise<T>((resolve, reject) => {
    transaction.oncomplete = () => result.then(resolve, reject);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export const idb = {
  get<T>(store: StoreName, key: string): Promise<T | undefined> {
    return withStore<T>(store, 'readonly', (s) => s.get(key));
  },

  getAll<T>(store: StoreName): Promise<T[]> {
    return withStore<T[]>(store, 'readonly', (s) => s.getAll());
  },

  keys(store: StoreName): Promise<string[]> {
    return withStore<IDBValidKey[]>(store, 'readonly', (s) => s.getAllKeys())
      .then((keys) => keys.map(String));
  },

  put<T>(store: StoreName, key: string, value: T): Promise<void> {
    return withStore(store, 'readwrite', (s) => s.put(value, key)).then(() => undefined);
  },

  delete(store: StoreName, key: string): Promise<void> {
    return withStore(store, 'readwrite', (s) => s.delete(key)).then(() => undefined);
  },

  /** Delete every entry the predicate accepts, in one transaction. Resolves with the count. */
  async deleteWhere<T>(store: StoreName, predicate: (value: T, key: string) => boolean): Promise<number> {
    const db = await openDb();
    const transaction = db.transaction(store, 'readwrite');
    let deleted = 0;

    transaction.objectStore(store).openCursor().onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) return;
      if (predicate(cursor.value, String(cursor.key))) {
        cursor.delete();
        deleted++;
      }
      cursor.continue();
    };

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(deleted);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  },

  clear(store: StoreName): Promise<void> {
    return withStore(store, 'readwrite', (s) => s.clear()).then(() => undefined);
  }
};
