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
import { Category } from 'app/models/category.model';
import { Subcategory } from 'app/models/subcategory.model';
import { Severity } from 'app/models/severity.model';
import { Country } from 'app/models/country.model';
import { QualityControl } from 'app/models/quality_control.model';
import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { JsonApiDatastore, JsonApiDatastoreConfig, JsonApiModel, JsonApiQueryData, ModelType } from 'angular2-jsonapi';
import { Observation } from 'app/models/observation.model';
import { Law } from 'app/models/law.model';

@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: environment.apiUrl.endsWith("/") ? environment.apiUrl : environment.apiUrl + "/",
  models: {
    observations: Observation,
    countries: Country,
    severities: Severity,
    categories: Category,
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
    'quality-controls': QualityControl,
    'observation-reports': ObservationReport,
    'observation-documents': ObservationDocument
  }
})
export class DatastoreService extends JsonApiDatastore {
}
