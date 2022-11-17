import { JsonApiService } from 'app/services/json-api.service';
import { environment } from 'environments/environment.dev';
import { Http } from '@angular/http';
import { Category } from 'app/models/category.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CategoriesService extends JsonApiService<Category> {

  public model = Category;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  getAll() {
    return this.datastoreService.query(Category).toPromise();
  }
}
