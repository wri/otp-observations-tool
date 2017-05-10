import { environment } from 'environments/environment.dev';
import { Http } from '@angular/http';
import { Law } from 'app/models/law.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';

@Injectable()
export class LawsService {

    constructor(
      private datastoreService: DatastoreService,
      private http: Http
    ) {

    }

    getAll(){
        return this.datastoreService.query(Law, { page: { size: 100 }}).toPromise();
    }

    createLaw(formValues): Promise<any> {
      const payload = { law: formValues };
      return this.http.post(`${environment.apiUrl}/laws`, payload)
        .map(response => response.json())
        .toPromise();
    }

    deleteLaw(law:Law): Promise<any>{
      return this.datastoreService.deleteRecord(Law, law.id)
        .toPromise();
    }
}
