import { JsonApiService } from 'app/services/json-api.service';
import { Country } from 'app/models/country.model';
import { Government } from './../models/government.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GovernmentsService extends JsonApiService<Government> {

  public model = Government;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  getAll(params = {}) {
    return this.datastoreService.findAll(Government, Object.assign(
      {},
      { page: { size: 1000 } },
      params
    )).toPromise().then((data) => data.getModels());
  }

  /**
   * Return the government entity designated by its id
   * @param {string} id - Id of the government entity
   * @param {any} [params={}] - Additional params for the query
   * @returns {Promise<Government[]>}
   */
  getById(id: string, params = {}): Promise<Government> {
    return this.datastoreService.findRecord(Government, id, params)
      .toPromise();
  }

  createGovernment(formValues): Promise<any> {
    const payload = { government: formValues };
    return this.http.post(`${environment.apiUrl}/governments`, payload).toPromise();
  }

  deleteGovernment(government: Government): Promise<any> {
    return this.datastoreService.deleteRecord(Government, government.id).toPromise();
  }
}
