import { environment } from 'environments/environment.dev';
import { Species } from 'app/models/species.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class SpeciesService {

    constructor(
      private datastoreService: DatastoreService,
      private http: Http
      ) {

    }

    getAll(){
        return this.datastoreService.query(Species, { page: { size: 100 } }).toPromise();
    }

    createSpecies(formValues): Promise<any> {
      const payload = { species: formValues };
      return this.http.post(`${environment.apiUrl}/species`, payload)
        .map(response => response.json())
        .toPromise();
    }
}
