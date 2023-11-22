import { JsonApiService } from 'app/services/json-api.service';
import { Subcategory } from 'app/models/subcategory.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SubcategoriesService extends JsonApiService<Subcategory> {

  public model = Subcategory;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  /**
   * Return the list of all the subcategories
   * @params {*} [params={}] Additional params for the query
   * @returns {Promise<Subcategory[]>}
   */
  getAll(params: any = {}): Promise<Subcategory[]> {
    return this.datastoreService
      .findAll(Subcategory, Object.assign({}, { page: { size: 3000 } }, params))
      .toPromise()
      .then((data) => data.getModels());
  }

  /**
   * Return the subcategories that match the type
   *
   * @param {('operator'|'government')} type - Type of the subcategories to load
   * @param {*} [params={}] - Custom params for the query (such as "include")
   * @returns {Promise<Subcategory[]>}
   */
  getByType(type: 'operator'|'government', params: any = {}): Promise<Subcategory[]> {
    return this.datastoreService.findAll(Subcategory, Object.assign({}, {
      page: { size: 3000 },
      filter: {
        'subcategory-type': type
      }
    }, params)).toPromise().then((data) => data.getModels());
  }
}
