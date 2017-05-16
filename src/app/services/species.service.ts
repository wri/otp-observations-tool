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

    getAll(): Promise<Species[]> {
      return this.datastoreService.query(Species, { page: { size: 100 } }).toPromise();
    }

    getById(speciesId: string): Promise<Species> {
      return this.datastoreService.findRecord(Species, speciesId).toPromise();
    }

    createSpecies(formValues): Promise<any> {
      const payload = { species: formValues };
      return this.http.post(`${environment.apiUrl}/species`, payload)
        .map(response => response.json())
        .toPromise();
    }

    updateSpecies(species: Species): Promise<any> {
      debugger;
      const payload = {
        species: {
          name: species.name,
          scientific_name: species.scientific_name,
          common_name: species.common_name,
          country_ids: species.countries,
          species_class: species.species_class,
          sub_species: species.sub_species,
          cites_status: species.cites_status,
          cites_id: species.cites_id,
          iucn_status: species.iucn_status
        }
      };

      return this.http.patch(`${environment.apiUrl}/species/${species.id}`, payload)
        .map(response => response.json())
        .toPromise();
    }

    deleteSpecies(species: Species): Promise<any> {
      return this.datastoreService.deleteRecord(Species, species.id).toPromise();
    }
}
