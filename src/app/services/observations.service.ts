import { environment } from './../../environments/environment';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { DatastoreService } from 'app/services/datastore.service';
import { Observation } from 'app/models/observation.model';

@Injectable()
export class ObservationsService {

  constructor (
    private datastoreService: DatastoreService,
    private http: Http
  ) {}

  getAll(): Promise<Observation[]> {
    return this.datastoreService.query(Observation).toPromise();
  }
  getByType(type: string): Promise<Observation[]> {
    return this.datastoreService.query(Observation, {
      type: type,
      sort: '-created_at'
    }).toPromise();
  }

  getById(id: string): Promise<Observation> {
    return this.datastoreService.findRecord(Observation, id).toPromise();
  }

  createObservation(formValues): Promise<any> {
    const payload = { observation: formValues };
    return this.http.post(`${environment.apiUrl}/observations`, payload)
      .map(response => response.json())
      .toPromise();
  }

  deleteObservationWithId(id): Promise<any> {
    return this.http.delete(`${environment.apiUrl}/observations/${id}`)
      .map(response => response.json())
      .toPromise();
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
    return this.http.patch(`${environment.apiUrl}/observations/${observation.id}`, payload)
      .map(response => response.json())
      .toPromise();
  }

}
