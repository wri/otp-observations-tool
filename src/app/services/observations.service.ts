import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { DatastoreService } from 'app/services/datastore.service';
import { Observation } from 'app/models/observation.model';
import { JsonApiParams, JsonApiService } from 'app/services/json-api.service';
import { Observable } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { DraftObservation } from 'app/models/draft_observation.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ObservationsService extends JsonApiService<Observation> {

  model = Observation;

  constructor (
    protected datastoreService: DatastoreService,
    protected http: HttpClient,
    private authService: AuthService
  ) {
    super();
  }

  getAll(): Promise<Observation[]> {
    return this.datastoreService.query(Observation).toPromise();
  }

  /**
   * Get an observation by its ID
   * @param {string} id - ID of the observation
   * @param {*} [params={}] Additional params for the request
   * @returns {Promise<Observation>}
   */
  getById(id: string, params: any = {}): Promise<Observation> {
    return this.datastoreService.findRecord(Observation, id, params)
      .toPromise();
  }

  createObservation(formValues): Promise<any> {
    const payload = { observation: formValues };
    return this.http.post(`${environment.apiUrl}/observations`, payload).toPromise();
  }

  deleteObservationWithId(id): Promise<any> {
    return this.http.delete(`${environment.apiUrl}/observations/${id}`).toPromise();
  }

  uploadFile(file: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}imports`, file);
  }

  updateObservation(observation: Observation): Promise<any> {

    let tempDate: any = observation.publication_date;
    if (tempDate.formatted) {
      tempDate = tempDate.formatted;
    }

    const observationUpdated = {
      evidence: observation.evidence,
      country_id: observation.country.id,
      details: observation.details,
      concern_opinion: observation.concern_opinion,
      litigation_status: observation.litigation_status,
      pv: observation.pv,
      annex_operator_id: observation.annex_operator ? observation.annex_operator.id : '',
      annex_governance_id: observation.annex_governance ? observation.annex_governance.id : '',
      severity_id: observation.severity ? observation.severity.id : '',
      observer_id: observation.observer ? observation.observer.id : '',
      operator_id: observation.operator ? observation.operator.id : '',
      government_id: observation.government ? observation.government.id : '',
      publication_date: tempDate,
      is_active: observation.is_active ? observation.is_active : '',
      lat: observation.lat,
      lng: observation.lng
    };

    const payload = { observation: observationUpdated };
    return this.http.patch(`${environment.apiUrl}/observations/${observation.id}`, payload).toPromise();
  }

  getDraftObservation() : DraftObservation {
    return JSON.parse(localStorage.getItem(this.draftObservationId));
  }

  saveDraftObservation(observation: DraftObservation) {
    localStorage.setItem(this.draftObservationId, JSON.stringify(observation));
  }

  removeDraftObservation() {
    localStorage.removeItem(this.draftObservationId);
  }

  private get draftObservationId() {
    const userId = this.authService.userId;
    const currentObserverId = this.authService.userObserverId;

    return `draftObservation-${userId}-${currentObserverId}`;
  }
}
