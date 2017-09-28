import { JsonApiService } from 'app/services/json-api.service';
import { Observer } from 'app/models/observer.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class ObserversService extends JsonApiService<Observer> {

  public model = Observer;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  /**
   * Return the list of all the observers
   * @param {*} [params={}] Additional params for the query
   * @returns Promise<Observer[]>
   */
  getAll(params: any = {}): Promise<Observer[]> {
    return this.datastoreService.query(Observer, Object.assign({}, { page: { size: 3000 }}, params))
      .toPromise();
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

  createObserver(formValues): Promise<any> {
    const payload = { observer: formValues };
    return this.http.post(`${environment.apiUrl}/observers`, payload)
      .map(response => response.json())
      .toPromise();
  }

  deleteObserver(observer: Observer): Promise<any> {
    return this.datastoreService.deleteRecord(Observer, observer.id).toPromise();
  }
}
