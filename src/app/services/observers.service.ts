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

    getAll(){
        return this.datastoreService.query(Observer, { page: { size: 1000 }}).toPromise();
    }

    createObserver(formValues): Promise<any> {
      const payload = { observer: formValues };
      return this.http.post(`${environment.apiUrl}/observers`, payload)
        .map(response => response.json())
        .toPromise();
    }
}
