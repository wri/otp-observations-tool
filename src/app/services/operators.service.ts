import { JsonApiService } from 'app/services/json-api.service';
import { environment } from 'environments/environment.dev';
import { Operator } from 'app/models/operator.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class OperatorsService extends JsonApiService<Operator> {

  public model = Operator;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  /**
   * Return the list of operators
   * @param {any} [params={}] Additional params for the query
   * @returns {Promise<Operator[]>}
   */
  getAll(params = {}): Promise<Operator[]> {
    return this.datastoreService.query(Operator, Object.assign(
      {},
      { page: { size: 3000 }},
      params
    )).toPromise();
  }

  /**
   * Return the operator designated by its id
   * @param {string} id - Id of the operator
   * @param {any} [params={}] - Additional params for the query
   * @returns {Promise<Operator[]>}
   */
  getById(id: string, params = {}): Promise<Operator> {
    return this.datastoreService.findRecord(Operator, id, params)
      .toPromise();
  }

  getByCountry(countryId): Promise<Operator[]> {
    return this.datastoreService.query(Operator, { countr_id: countryId, page: { size: 10000 }}).toPromise();
  }

  createOperator(formValues): Promise<any> {
    const payload = { operator: formValues };
    return this.http.post(`${environment.apiUrl}/operators`, payload)
      .map(response => response.json())
      .toPromise();
  }

  deleteOperator(operator: Operator): Promise<any> {
    return this.datastoreService.deleteRecord(Operator, operator.id).toPromise();
  }
}
