import { JsonApiService } from 'app/services/json-api.service';
import { environment } from 'environments/environment.dev';
import { Species } from 'app/models/species.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class SpeciesService extends JsonApiService<Species> {

  public model = Species;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  getAll() {
    return this.datastoreService.query(Species, { page: { size: 100 } }).toPromise();
  }

  createSpecies(formValues): Promise<any> {
    const payload = { species: formValues };
    return this.http.post(`${environment.apiUrl}/species`, payload)
      .map(response => response.json())
      .toPromise();
  }

  deleteSpecies(species: Species): Promise<any> {
    return this.datastoreService.deleteRecord(Species, species.id).toPromise();
  }
}
