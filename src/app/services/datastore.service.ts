import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JsonApiDatastore, JsonApiDatastoreConfig } from 'angular2-jsonapi';
import { Observation } from 'app/models/observation.model';

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: environment.apiUrl,
  models: {
    observations: Observation
  }
})
export class DatastoreService extends JsonApiDatastore {

  constructor (http: Http) {
    super(http);
  }

}
