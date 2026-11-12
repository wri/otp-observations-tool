import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DraftObservation } from 'app/models/draft_observation.interface';
import { idb, isIndexedDbAvailable, STORES } from 'app/services/offline/indexed-db';

/**
 * - draft:   being filled in, never submitted
 * - queued:  submitted, waiting for a connection
 * - syncing: being sent right now
 * - failed:  the API refused it; the user has to fix it and submit again
 */
export type OutboxStatus = 'draft' | 'queued' | 'syncing' | 'failed';

export interface OutboxProgress {
  /** Server id of the report created for this entry, once that step succeeded */
  reportId?: string;
  /** What the created report was made of, to notice when the user changed it since */
  reportFingerprint?: string;
  /** Server ids of the documents created for this entry, by the document's localId */
  documentIds: Record<string, string>;
}

export interface OutboxEntry {
  id: string;
  userId: string;
  observerId: string;
  status: OutboxStatus;
  draft: DraftObservation;
  createdAt: string;
  updatedAt: string;
  /** Why the last submission failed, shown to the user */
  error?: string;
  progress: OutboxProgress;
}

/**
 * Observations created on this device: drafts, and those waiting to be sent to the API.
 *
 * Replaces the single localStorage draft (one per user and observer) with any number of
 * entries in IndexedDB, which is not subject to localStorage's ~5MB limit that the base64
 * attachments would hit.
 */
@Injectable()
export class OutboxService {
  private entriesSubject = new BehaviorSubject<OutboxEntry[]>([]);
  private loaded: Promise<void> = null;

  get isAvailable(): boolean {
    return isIndexedDbAvailable();
  }

  /** Every entry on the device, for every user, most recently updated first */
  get entries$(): Observable<OutboxEntry[]> {
    this.ensureLoaded();
    return this.entriesSubject.asObservable();
  }

  entriesForUser$(userId: string): Observable<OutboxEntry[]> {
    return this.entries$.pipe(map((entries) => entries.filter((e) => e.userId === userId)));
  }

  entriesForObserver$(userId: string, observerId: string): Observable<OutboxEntry[]> {
    return this.entries$.pipe(map((entries) =>
      entries.filter((e) => e.userId === userId && e.observerId === observerId)));
  }

  async getAll(): Promise<OutboxEntry[]> {
    await this.ensureLoaded();
    return this.entriesSubject.value;
  }

  async get(id: string): Promise<OutboxEntry | null> {
    if (!this.isAvailable) return null;
    return (await idb.get<OutboxEntry>(STORES.outbox, id)) || null;
  }

  /**
   * Store the current state of a form. Creates the entry when `id` is null.
   *
   * An entry that is queued or being sent is left alone: the form's autosave must not turn
   * a submitted observation back into a draft.
   */
  async saveDraft(id: string | null, userId: string, observerId: string, draft: DraftObservation): Promise<OutboxEntry> {
    const existing = id ? await this.get(id) : null;

    if (existing && ['queued', 'syncing'].includes(existing.status)) {
      return existing;
    }

    const now = new Date().toISOString();
    const entry: OutboxEntry = existing
      ? { ...existing, draft, updatedAt: now, status: 'draft' }
      : {
        id: id || this.generateId(),
        userId,
        observerId,
        status: 'draft',
        draft,
        createdAt: now,
        updatedAt: now,
        progress: { documentIds: {} }
      };

    await this.write(entry);
    return entry;
  }

  async setStatus(id: string, status: OutboxStatus, error: string = null): Promise<OutboxEntry | null> {
    const entry = await this.get(id);
    if (!entry) return null;

    const updated: OutboxEntry = { ...entry, status, error, updatedAt: new Date().toISOString() };
    await this.write(updated);
    return updated;
  }

  async saveProgress(id: string, progress: OutboxProgress): Promise<void> {
    const entry = await this.get(id);
    if (!entry) return;

    await this.write({ ...entry, progress });
  }

  async remove(id: string): Promise<void> {
    if (!this.isAvailable) return;
    await idb.delete(STORES.outbox, id);
    await this.refresh();
  }

  /**
   * Move the draft the previous version kept in localStorage into the outbox.
   */
  async migrateLegacyDraft(userId: string, observerId: string): Promise<void> {
    if (!this.isAvailable) return;

    const key = `draftObservation-${userId}-${observerId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const draft: DraftObservation = JSON.parse(raw);
      if (draft) {
        await this.saveDraft(null, userId, observerId, draft);
      }
      localStorage.removeItem(key);
    } catch (err) {
      console.error('Could not migrate the legacy draft', err);
    }
  }

  private async write(entry: OutboxEntry): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('IndexedDB is not available, the observation cannot be saved on this device');
    }
    await idb.put(STORES.outbox, entry.id, entry);
    await this.refresh();
  }

  private ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      this.loaded = this.refresh();
    }
    return this.loaded;
  }

  private async refresh(): Promise<void> {
    if (!this.isAvailable) return;

    try {
      const entries = await idb.getAll<OutboxEntry>(STORES.outbox);
      entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      this.entriesSubject.next(entries);
    } catch (err) {
      console.error('Could not read the outbox', err);
    }
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
