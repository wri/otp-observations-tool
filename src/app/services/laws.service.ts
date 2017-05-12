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

    getAll(): Promise<Law[]> {
        return this.datastoreService.query(Law, { page: { size: 100 }}).toPromise();
    }

    getById(lawId): Promise<Law> {
      return this.datastoreService.findRecord(Law, lawId).toPromise();
    }

    createLaw(formValues): Promise<any> {
      const payload = { law: formValues };
      return this.http.post(`${environment.apiUrl}/laws`, payload)
        .map(response => response.json())
        .toPromise();
    }

    updateLaw(law: Law): Promise<any> {
      const payload = { law: {
          country_id: law.country.id,
          legal_reference: law.legal_reference,
          vpa_indicator: law.vpa_indicator,
          legal_penalty: law.legal_penalty,
        }
      };

      return this.http.patch(`${environment.apiUrl}/laws/${law.id}`, payload)
        .map(response => response.json())
        .toPromise();
    }

    deleteLaw(law:Law): Promise<any>{
      return this.datastoreService.deleteRecord(Law, law.id)
        .toPromise();
    }

}
