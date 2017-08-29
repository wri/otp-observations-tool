import { JsonApiService } from 'app/services/json-api.service';
import { environment } from 'environments/environment.dev';
import { Subcategory } from 'app/models/subcategory.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class SubcategoriesService extends JsonApiService<Subcategory> {

  public model = Subcategory;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  getAll() {
    return this.datastoreService.query(Subcategory, { page: { size: 100 } }).toPromise();
  }
}
