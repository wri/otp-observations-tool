import { Country } from 'app/models/country.model';
import { Government } from './../models/government.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class GovernmentsService {

    constructor(
      private datastoreService: DatastoreService,
      private http: Http){

    }

    getAll(){
      return this.datastoreService.query(Government, { page: { size: 1000 } }).toPromise();
    }

    getByCountry(countryId){
      return this.datastoreService.query(Government, { country_id: countryId }).toPromise();
    }

    createGovernment(formValues): Promise<any> {
      const payload = { government: formValues };
      return this.http.post(`${environment.apiUrl}/governments`, payload)
        .map(response => response.json())
        .toPromise();
    }
}
