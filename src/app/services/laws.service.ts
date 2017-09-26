import { Http } from '@angular/http';
import { DatastoreService } from 'app/services/datastore.service';
import { Law } from 'app/models/law.model';
import { JsonApiService } from 'app/services/json-api.service';
import { Injectable } from '@angular/core';

@Injectable()
export class LawsService extends JsonApiService<Law> {

  model = Law;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  /**
   * Return the list of all the laws
   * @param {*} [params={}] Additional params for the query
   * @returns Promise<Law[]>
   */
  getAll(params: any = {}): Promise<Law[]> {
    return this.datastoreService.query(Law, Object.assign({}, { page: { size: 3000 }}, params))
      .toPromise();
  }

  /**
   * Get a law by its ID
   * @param {string} id - ID of the law
   * @param {*} [params={}] Additional params for the request
   * @returns {Promise<Law>}
   */
  getById(id: string, params: any = {}): Promise<Law> {
    return this.datastoreService.findRecord(Law, id, params)
      .toPromise();
  }

}
