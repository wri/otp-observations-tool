import { JsonApiService } from 'app/services/json-api.service';
import { Fmu } from 'app/models/fmu.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FmusService extends JsonApiService<Fmu> {

  public model = Fmu;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  /**
   * Return the list of fmus
   * @param {any} [params={}] Additional params for the query
   * @returns {Promise<Fmu[]>}
   */
  getAll(params = {}): Promise<Fmu[]> {
    return this.datastoreService.findAll(Fmu, Object.assign(
      {},
      { page: { size: 3000 } },
      params
    )).toPromise().then((data) => data.getModels());
  }

  /**
   * Return the FMU designated by its id
   *
   * The API exposes no /fmus/:id route, so this goes through the collection with an id
   * filter rather than findRecord, which would 404.
   *
   * @param {string} id ID of the FMU
   * @param {any} [params={}] Additional params for the query
   * @returns {Promise<Fmu>}
   */
  getById(id: string, params: any = {}): Promise<Fmu> {
    return this.getAll(Object.assign({}, params, { filter: { id } }))
      .then((fmus) => fmus[0] || null);
  }
}
