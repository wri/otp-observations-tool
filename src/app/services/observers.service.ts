import { JsonApiService } from 'app/services/json-api.service';
import { Observer } from 'app/models/observer.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ObserversService extends JsonApiService<Observer> {

  public model = Observer;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  /**
   * Return the list of all the observers
   * @param {*} [params={}] Additional params for the query
   * @returns Promise<Observer[]>
   */
  getAll(params: any = {}): Promise<Observer[]> {
    return this.datastoreService.findAll(Observer, Object.assign({}, { page: { size: 3000 } }, params))
      .toPromise().then((data) => data.getModels());
  }

  /**
   * Return the observer designated by its id
   * @param {string} id ID of the observer
   * @param {*} [params={}] Additional params for the query
   */
  getById(id: string, params: any = {}): Promise<Observer> {
    return this.datastoreService.findRecord(Observer, id, params)
      .toPromise();
  }
}
