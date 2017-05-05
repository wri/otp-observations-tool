import { Category } from 'app/models/category.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CategoriesService {

    constructor(private datastoreService: DatastoreService) {

    }

    getAll(){
        return this.datastoreService.query(Category).toPromise();
    }
}
