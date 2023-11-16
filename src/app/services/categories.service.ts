import { JsonApiService } from 'app/services/json-api.service';
import { Category } from 'app/models/category.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CategoriesService extends JsonApiService<Category> {

  public model = Category;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  getAll() {
    return this.datastoreService.findAll(Category).toPromise().then((data) => data.getModels());
  }
}
