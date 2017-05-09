import { Species } from 'app/models/species.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class SpeciesService {

    constructor(private datastoreService: DatastoreService) {

    }

    getAll(){
        return this.datastoreService.query(Species).toPromise();
    }
}
