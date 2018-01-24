import { Http } from '@angular/http';
import { DatastoreService } from 'app/services/datastore.service';
import { ObservationReport } from 'app/models/observation_report';
import { JsonApiService } from 'app/services/json-api.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ObservationReportsService extends JsonApiService<ObservationReport> {

  model = ObservationReport;

  constructor (
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  /**
   * Return the list of all the observation reports
   * @param {*} [params={}] Additional params for the query
   * @returns Promise<ObservationReport[]>
   */
  getAll(params: any = {}): Promise<ObservationReport[]> {
    return this.datastoreService.query(ObservationReport, Object.assign({}, { page: { size: 3000 }}, params))
      .toPromise();
  }

  /**
   * Get an observation report by its ID
   * @param {string} id - ID of the observation report
   * @param {*} [params={}] Additional params for the request
   * @returns {Promise<ObservationReport>}
   */
  getById(id: string, params: any = {}): Promise<ObservationReport> {
    return this.datastoreService.findRecord(ObservationReport, id, params)
      .toPromise();
  }

}
