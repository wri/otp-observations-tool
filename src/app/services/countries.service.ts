import { JsonApiService } from 'app/services/json-api.service';
import { Country } from 'app/models/country.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CountriesService extends JsonApiService<Country> {

  public model = Country;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  /**
   * Return the list of all the countries
   * @params {*} [params={}] Additional params for the query
   * @returns {Promise<Country[]>}
   */
  getAll(params: any = {}): Promise<Country[]> {
    return this.datastoreService
      .query(Country, Object.assign({}, { page: { size: 3000 }, 'filter[is-active]': 'all' }, params))
      .toPromise();
  }

  createCountry(formValues): Promise<any> {
    const payload = { country: formValues };
    return this.http.post(`${environment.apiUrl}/countries`, payload).toPromise();
  }

  deleteCountry(country: Country): Promise<any> {
    return this.datastoreService.deleteRecord(Country, country.id).toPromise();
  }
}
