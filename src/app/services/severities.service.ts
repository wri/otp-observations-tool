import { JsonApiService } from 'app/services/json-api.service';
import { environment } from 'environments/environment.dev';
import { Severity } from 'app/models/severity.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SeveritiesService extends JsonApiService<Severity> {

  public model = Severity;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  /**
   * Return the list of severities
   * @param {any} [params={}] Additional params for the query
   * @returns {Promise<Severity[]>}
   */
  getAll(params = {}): Promise<Severity[]> {
    return this.datastoreService.findAll(Severity, Object.assign(
      {},
      { page: { size: 3000 }},
      params
    )).toPromise().then((data) => data.getModels());
  }
}
