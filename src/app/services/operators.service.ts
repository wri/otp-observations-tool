import { JsonApiService } from 'app/services/json-api.service';
import { Operator } from 'app/models/operator.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OperatorsService extends JsonApiService<Operator> {

  public model = Operator;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  /**
   * Return the list of operators
   * @param {any} [params={}] Additional params for the query
   * @returns {Promise<Operator[]>}
   */
  getAll(params = {}): Promise<Operator[]> {
    return this.datastoreService.findAll(Operator, Object.assign(
      {},
      { page: { size: 3000 } },
      params
    )).toPromise().then((data) => data.getModels());
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

  deleteOperator(operator: Operator): Promise<any> {
    return this.datastoreService.deleteRecord(Operator, operator.id).toPromise();
  }
}
