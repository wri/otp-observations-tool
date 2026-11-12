import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { JsonApiModel } from '@michalkotas/angular2-jsonapi';
import { DatastoreService } from 'app/services/datastore.service';
import { ConnectivityService, isNetworkError } from 'app/services/offline/connectivity.service';
import { OutboxEntry, OutboxService } from 'app/services/offline/outbox.service';
import { DraftObservation } from 'app/models/draft_observation.interface';
import { Observation } from 'app/models/observation.model';
import { ObservationReport } from 'app/models/observation_report';
import { ObservationDocument } from 'app/models/observation_document';
import { Country } from 'app/models/country.model';
import { Subcategory } from 'app/models/subcategory.model';
import { Severity } from 'app/models/severity.model';
import { Observer } from 'app/models/observer.model';
import { Operator } from 'app/models/operator.model';
import { Government } from 'app/models/government.model';
import { Law } from 'app/models/law.model';
import { Fmu } from 'app/models/fmu.model';

export type SubmissionResult =
  /** The API accepted the observation; the entry is gone from the outbox */
  | { status: 'sent' }
  /** Offline, session gone or server error: the entry stays queued and is retried later */
  | { status: 'deferred', reason: 'offline' | 'unauthorized' | 'server' }
  /** The API refused it: the entry is marked failed and the user has to fix it */
  | { status: 'failed', message: string };

type ModelType<T extends JsonApiModel> = new (...args: any[]) => T;

/**
 * Sends the observations of the outbox to the API.
 *
 * Creating an observation is three steps, in order: the report (when a new one was
 * uploaded), the evidence documents, the observation itself. The server id each step
 * yields is written to the entry before the next step runs, so an entry that failed
 * halfway resumes where it stopped instead of uploading the same report twice.
 *
 * The models are rebuilt from the draft with id-only stubs for the relationships: the
 * JSON:API payload only carries `{ type, id }` for a related record anyway.
 */
@Injectable()
export class ObservationSubmissionService {
  private syncingSubject = new BehaviorSubject<boolean>(false);
  private syncRun: Promise<void> = null;

  get syncing$() {
    return this.syncingSubject.asObservable();
  }

  get isSyncing(): boolean {
    return this.syncingSubject.value;
  }

  constructor(
    private datastore: DatastoreService,
    private outbox: OutboxService,
    private connectivity: ConnectivityService
  ) {}

  /**
   * Send every queued entry of a user, one after the other. Stops at the first entry that
   * has to be deferred (no point retrying the next ones against a dead connection).
   */
  syncAll(userId: string): Promise<void> {
    if (this.syncRun) return this.syncRun;

    this.syncRun = this.runSync(userId).finally(() => this.syncRun = null);
    return this.syncRun;
  }

  private async runSync(userId: string): Promise<void> {
    if (!userId || !this.connectivity.isOnline) return;

    const entries = (await this.outbox.getAll())
      // 'syncing' entries are leftovers of a page closed mid-upload
      .filter((e) => e.userId === userId && ['queued', 'syncing'].includes(e.status))
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

    if (!entries.length) return;

    this.syncingSubject.next(true);
    try {
      for (const entry of entries) {
        const result = await this.submit(entry.id);
        if (result.status === 'deferred') break;
      }
    } finally {
      this.syncingSubject.next(false);
    }
  }

  /**
   * Send one entry now. The entry must exist; its status is updated along the way.
   */
  async submit(entryId: string): Promise<SubmissionResult> {
    const entry = await this.outbox.get(entryId);
    if (!entry) {
      return { status: 'failed', message: 'The observation is no longer on this device' };
    }

    if (!this.connectivity.isOnline) {
      await this.outbox.setStatus(entry.id, 'queued');
      return { status: 'deferred', reason: 'offline' };
    }

    await this.outbox.setStatus(entry.id, 'syncing');

    try {
      await this.send(entry);
      await this.outbox.remove(entry.id);
      return { status: 'sent' };
    } catch (err) {
      console.error('Observation submission failed', err);
      return this.handleFailure(entry, err);
    }
  }

  private async handleFailure(entry: OutboxEntry, err: any): Promise<SubmissionResult> {
    if (err instanceof HttpErrorResponse) {
      if (isNetworkError(err)) {
        await this.outbox.setStatus(entry.id, 'queued');
        return { status: 'deferred', reason: 'offline' };
      }
      if (err.status === 401) {
        await this.outbox.setStatus(entry.id, 'queued');
        return { status: 'deferred', reason: 'unauthorized' };
      }
      if (err.status >= 500) {
        await this.outbox.setStatus(entry.id, 'queued', `Server error (${err.status})`);
        return { status: 'deferred', reason: 'server' };
      }
    }

    // The datastore turns JSON:API error bodies into an ErrorResponse carrying `errors`
    const details: string[] = (err && Array.isArray(err.errors) ? err.errors : [])
      .map((e) => e.detail || e.title)
      .filter((d) => !!d);
    const message = details.length ? details.join('\n') : (err && err.message) || 'Unknown error';

    await this.outbox.setStatus(entry.id, 'failed', message);
    return { status: 'failed', message };
  }

  private async send(entry: OutboxEntry): Promise<void> {
    const draft = entry.draft;
    const progress = { documentIds: {}, ...entry.progress };
    const observers = this.observerStubs(entry, draft);

    // 1. The report, when a new one was uploaded with the observation
    const newReport = !draft.observationReportId && !!draft.reportAttachment;
    if (newReport) {
      const fingerprint = [draft.reportTitle, draft.reportDate, draft.reportMissionType, (draft.reportAttachment || '').length].join('|');
      if (progress.reportId && progress.reportFingerprint !== fingerprint) {
        // The user changed the report after a failed attempt: the one we created is stale
        progress.reportId = null;
      }
      if (!progress.reportId) {
        const report = this.datastore.createRecord(ObservationReport, {
          title: draft.reportTitle,
          attachment: draft.reportAttachment,
          'publication-date': draft.reportDate ? new Date(draft.reportDate) : null,
          'mission-type': draft.reportMissionType,
          observers
        });
        const saved = await report.save().toPromise();
        progress.reportId = saved.id;
        progress.reportFingerprint = fingerprint;
        await this.outbox.saveProgress(entry.id, progress);
      }
    }

    const reportId = draft.observationReportId || (newReport ? progress.reportId : null);
    const report = reportId ? this.stub(ObservationReport, reportId) : null;

    // 2. The evidence documents, each linked to the report
    const documents: ObservationDocument[] = [];
    if (draft.evidenceType === 'Uploaded documents') {
      for (const document of draft.documents || []) {
        const createdId = document.localId && progress.documentIds[document.localId];
        const serverId = createdId || (document.id && String(document.id));

        if (serverId && (createdId || document['observation-report-id'])) {
          // Created by a previous attempt, or picked from the report's library
          documents.push(this.stub(ObservationDocument, serverId));
          continue;
        }

        const record = serverId
          // Exists but is not attached to a report yet: only the link is sent
          ? this.stub(ObservationDocument, serverId)
          : this.datastore.createRecord(ObservationDocument, {
            name: document.name,
            'document-type': document['document-type'],
            attachment: document.attachment
          });
        record['observation-report'] = report;

        const saved = await record.save().toPromise();
        if (document.localId) {
          progress.documentIds[document.localId] = saved.id;
          await this.outbox.saveProgress(entry.id, progress);
        }
        documents.push(this.stub(ObservationDocument, saved.id));
      }
    }

    // 3. The observation
    const model: any = {
      'observation-type': draft.observationType,
      'publication-date': new Date(),
      details: draft.details,
      'actions-taken': draft.actionsTaken,
      'validation-status': draft.validationStatus,
      'concern-opinion': draft.concernOpinion,
      'evidence-type': draft.evidenceType,
      'evidence-on-report': draft.evidenceOnReport,
      'non-concession-activity': draft.nonConcessionActivity || false,
      locale: draft.locale,
      country: this.stub(Country, draft.countryId),
      subcategory: this.stub(Subcategory, draft.subcategoryId),
      severity: this.stub(Severity, draft.severityId),
      observers,
      'relevant-operators': (draft.relevantOperators || []).map((id) => this.stub(Operator, id)),
      'observation-report': report,
      'observation-documents': documents
    };

    if (draft.observationType === 'operator') {
      model.operator = this.stub(Operator, draft.operatorId);
      model['is-physical-place'] = draft.isPhysicalPlace;
      model.lat = draft.isPhysicalPlace ? draft.lat : null;
      model.lng = draft.isPhysicalPlace ? draft.lng : null;
      model['litigation-status'] = draft.litigationStatus;
      model.law = this.stub(Law, draft.lawId);
      model.pv = draft.pv;
      model.fmu = draft.isPhysicalPlace ? this.stub(Fmu, draft.fmuId) : null;
      model['location-accuracy'] = draft.locationAccuracy;
      model['location-information'] = draft.locationInformation;
    } else {
      model.governments = (draft.governments || []).map((id) => this.stub(Government, id));
    }

    const observation = this.datastore.createRecord(Observation, model);
    await observation.save({ locale: draft.locale }).toPromise();
  }

  private observerStubs(entry: OutboxEntry, draft: DraftObservation): Observer[] {
    const ids = Array.from(new Set([...(draft.observers || []), entry.observerId].filter((id) => !!id)));
    return ids.map((id) => this.stub(Observer, id));
  }

  /**
   * A model carrying only its id, enough for the serializer to reference it. The record
   * in the datastore is preferred when there is one, to keep the datastore consistent.
   */
  private stub<T extends JsonApiModel>(modelType: ModelType<T>, id: string | number): T | null {
    if (id === null || id === undefined || id === '') return null;

    const key = String(id);
    return this.datastore.peekRecord(modelType as any, key) as T
      || this.datastore.createRecord(modelType as any, { id: key }) as T;
  }
}
