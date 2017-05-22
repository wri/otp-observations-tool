import { Observer } from 'app/models/observer.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class ObserversService {

    constructor(
      private datastoreService: DatastoreService,
      private http:Http
    ) {

    }

    getAll(): Promise<Observer[]> {
        return this.datastoreService.query(Observer, { page: { size: 1000 }}).toPromise();
    }

    createObserver(formValues): Promise<any> {
      const payload = { observer: formValues };
      return this.http.post(`${environment.apiUrl}/observers`, payload)
        .map(response => response.json())
        .toPromise();
    }

    updateObserver(observer: Observer): Promise<any> {
      const payload = { observer: {
          country_id: observer.country ? observer.country.id : '',
          name: observer.name,
          organization: observer.organization,
          observer_type: observer.observer_type,
          is_active: observer.is_active,
          logo: observer.logo
        }
      };

      return this.http.patch(`${environment.apiUrl}/observers/${observer.id}`, payload)
        .map(response => response.json())
        .toPromise();
    }

    deleteObserver(observer: Observer): Promise<any>{
      return this.datastoreService.deleteRecord(Observer, observer.id).toPromise();
    }

    getById(observerId): Promise<Observer> {
      return this.datastoreService.findRecord(Observer, observerId).toPromise();
    }
}
