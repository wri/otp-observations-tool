import { JsonApiService } from 'app/services/json-api.service';
import { Country } from 'app/models/country.model';
import { Government } from './../models/government.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class GovernmentsService extends JsonApiService<Government> {

  public model = Government;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  getAll() {
    return this.datastoreService.query(Government, { page: { size: 1000 } }).toPromise();
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

  getByCountry(countryId) {
    return this.datastoreService.query(Government, { country_id: countryId }).toPromise();
  }

  createGovernment(formValues): Promise<any> {
    const payload = { government: formValues };
    return this.http.post(`${environment.apiUrl}/governments`, payload)
      .map(response => response.json())
      .toPromise();
  }

  deleteGovernment(government: Government): Promise<any> {
    return this.datastoreService.deleteRecord(Government, government.id).toPromise();
  }
}
