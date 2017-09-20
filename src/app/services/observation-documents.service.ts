import { Http } from '@angular/http';
import { DatastoreService } from 'app/services/datastore.service';
import { ObservationDocument } from 'app/models/observation_document';
import { JsonApiService } from 'app/services/json-api.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ObservationDocumentsService extends JsonApiService<ObservationDocument> {

  model = ObservationDocument;

  constructor (
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  /**
   * Return the list of all the observation documents
   * @param {*} [params={}] Additional params for the query
   * @returns Promise<ObservationDocument[]>
   */
  getAll(params: any = {}): Promise<ObservationDocument[]> {
    return this.datastoreService.query(ObservationDocument, Object.assign({}, { page: { size: 3000 }}, params))
      .toPromise();
  }

}
