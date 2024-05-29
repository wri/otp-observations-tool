import { ObservationDocument } from 'app/models/observation_document';
import { Law } from 'app/models/law.model';
import { ObservationReport } from 'app/models/observation_report';
import { Fmu } from 'app/models/fmu.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany, BelongsTo } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { Species } from 'app/models/species.model';
import { User } from 'app/models/user.model';
import { Observer } from 'app/models/observer.model';
import { Operator } from 'app/models/operator.model';
import { Government } from 'app/models/government.model';
import { Subcategory } from 'app/models/subcategory.model';
import { Severity } from 'app/models/severity.model';
import { DateConverter } from './converters/date_converter';

@JsonApiModelConfig({
  type: 'observations'
})
export class Observation extends JsonApiModel {

  @Attribute() 'observation-type': string;
  @Attribute({ converter: new DateConverter() }) 'publication-date'?: Date;
  @Attribute() pv?: string;
  @Attribute() 'validation-status'?: string;
  @Attribute() details?: string;
  @Attribute() 'evidence-type': string;
  @Attribute() 'evidence-on-report'?: string;
  @Attribute() evidence?: string;
  @Attribute() 'concern-opinion'?: string;
  @Attribute() 'litigation-status'?: string;
  @Attribute() lat?: number;
  @Attribute() lng?: number;
  @Attribute() 'created-at'?: Date;
  @Attribute() 'updated-at'?: Date;
  @Attribute() 'actions-taken'?: string;
  @Attribute() 'location-information'?: string;
  @Attribute() 'location-accuracy'?: string;
  @Attribute() 'is-physical-place': boolean;
  @Attribute() 'hidden': boolean; // Whether an observation is archived
  @Attribute() 'admin-comment'?: string;
  @Attribute() 'monitor-comment'?: string;
  @Attribute() 'locale': string;

  @BelongsTo() fmu?: Fmu;
  @BelongsTo() law?: Law;
  @BelongsTo() country: Country;
  @BelongsTo() subcategory?: Subcategory;
  @BelongsTo() severity: Severity;
  @BelongsTo() user?: User;
  @BelongsTo() 'modified-user'?: User;
  @HasMany() observers?: Observer[]; // Should be a BelongsTo but not working with array
  @BelongsTo() operator?: Operator;
  @HasMany() governments?: Government[];
  @BelongsTo() 'observation-report'?: ObservationReport;
  @HasMany() 'relevant-operators'?: Operator[];
  @HasMany() 'observation-documents': ObservationDocument[];

  @HasMany() species: Species[];
}
