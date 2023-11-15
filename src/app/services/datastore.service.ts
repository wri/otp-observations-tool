import { ObservationDocument } from 'app/models/observation_document';
import { ObservationReport } from 'app/models/observation_report';
import { Fmu } from 'app/models/fmu.model';
import { UserPermission } from 'app/models/user_permission.model';
import { Document } from 'app/models/document.model';
import { User } from 'app/models/user.model';
import { Species } from 'app/models/species.model';
import { Operator } from 'app/models/operator.model';
import { Observer } from 'app/models/observer.model';
import { Government } from 'app/models/government.model';
import { Comment } from 'app/models/comment.model';
import { Category } from 'app/models/category.model';
import { Subcategory } from 'app/models/subcategory.model';
import { Severity } from 'app/models/severity.model';
import { Country } from 'app/models/country.model';
import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonApiDatastore, JsonApiDatastoreConfig } from 'angular2-jsonapi';
import { Observation } from 'app/models/observation.model';
import { Law } from 'app/models/law.model';

import { TokenService } from 'app/services/token.service';

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: environment.apiUrl,
  models: {
    observations: Observation,
    countries: Country,
    severities: Severity,
    categories: Category,
    comments: Comment,
    laws: Law,
    governments: Government,
    observers: Observer,
    operators: Operator,
    species: Species,
    users: User,
    subcategories: Subcategory,
    documents: Document,
    user_permissions: UserPermission,
    fmus: Fmu,
    'observation-reports': ObservationReport,
    'observation-documents': ObservationDocument
  }
})
export class DatastoreService extends JsonApiDatastore {

  constructor (http: HttpClient, private tokenService: TokenService) {
    super(http);

    this.tokenService.tokenChange.subscribe(() => this.setAPIHeaders());
    this.setAPIHeaders();
  }

  setAPIHeaders() {
    const headers = new Headers();
    if (this.tokenService.token) {
      headers.set('Authorization', `Bearer ${this.tokenService.token}`);
    }
    headers.set('OTP-API-KEY', environment.OTP_API_KEY);
    this.headers = headers;
  }
}
