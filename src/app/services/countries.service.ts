import { Http } from '@angular/http';
import { Country } from 'app/models/country.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class CountriesService {

    constructor(
      private datastoreService: DatastoreService,
      private http: Http
      ) {

    }

    /**
     * Return the list of all the countries
     * @returns {Promise<Country[]>}
     */
    getAll(): Promise<Country[]> {
        return this.datastoreService
          .query(Country, { page: { size: 10000 } })
          .toPromise();
    }

    createCountry(formValues): Promise<any> {
      const payload = { country: formValues };
      return this.http.post(`${environment.apiUrl}/countries`, payload)
        .map(response => response.json())
        .toPromise();
    }

    deleteCountry(country: Country): Promise<any> {
      return this.datastoreService.deleteRecord(Country, country.id).toPromise();
    }
}
