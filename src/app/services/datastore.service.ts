import { Document } from 'app/models/document.model';
import { TokenService } from 'app/services/token.service';
import { AnnexOperator } from 'app/models/annex-operator.model';
import { AnnexGovernance } from 'app/models/annex-governance.model';
import { User } from 'app/models/user.model';
import { Species } from 'app/models/species.model';
import { Operator } from 'app/models/operator.model';
import { Observer } from 'app/models/observer.model';
import { Government } from 'app/models/government.model';
import { Comment } from 'app/models/comment.model';
import { Law } from 'app/models/law.model';
import { Category } from 'app/models/category.model';
import { Severity } from 'app/models/severity.model';
import { Country } from 'app/models/country.model';
import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { JsonApiDatastore, JsonApiDatastoreConfig } from 'angular2-jsonapi';
import { Observation } from 'app/models/observation.model';

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: `${environment.apiUrl}/` ,
  models: {
    observations: Observation,
    countries: Country,
    severities: Severity,
    categories: Category,
    laws: Law,
    comments: Comment,
    governments: Government,
    observers: Observer,
    operators: Operator,
    species: Species,
    users: User,
    annex_governances: AnnexGovernance,
    annex_operators: AnnexOperator,
    documents: Document
  }
})
export class DatastoreService extends JsonApiDatastore {

  constructor (http: Http, private tokenService: TokenService) {
    super(http);

    const headers = new Headers();

    if (this.tokenService.token) {
      headers.set('Authorization', `Bearer ${this.tokenService.token}`);
    }
    headers.set('OTP-API-KEY', environment.OTP_API_KEY);

    this.headers = headers;
  }

}
