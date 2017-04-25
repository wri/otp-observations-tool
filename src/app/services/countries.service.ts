import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class CountriesService {

    constructor(private http: Http) {

    }

    getAll(){
        return this.http.get(`${environment.apiUrl}/countries`)
        .map(response => response.json())
        .map(body => {
          return body.data.map(country => country.attributes.name);
        })
        .toPromise();
    }
}
