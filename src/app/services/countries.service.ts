import { Country } from 'app/models/country.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class CountriesService {

    constructor(private datastoreService: DatastoreService) {

    }

    getCountries(){
        return this.datastoreService.query(Country).toPromise();
    }
}
