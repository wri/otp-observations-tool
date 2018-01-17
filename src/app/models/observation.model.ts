import { Law } from 'app/models/law.model';
import { ObservationReport } from 'app/models/observation_report';
import { Fmu } from 'app/models/fmu.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany, BelongsTo } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { Species } from 'app/models/species.model';
import { User } from 'app/models/user.model';
import { Photo } from 'app/models/photo.model';
import { Document } from 'app/models/document.model';
import { Comment } from 'app/models/comment.model';
import { Observer } from 'app/models/observer.model';
import { Operator } from 'app/models/operator.model';
import { Government } from 'app/models/government.model';
import { Subcategory } from 'app/models/subcategory.model';
import { Severity } from 'app/models/severity.model';

@JsonApiModelConfig({
    type: 'observations'
})
export class Observation extends JsonApiModel {

  @Attribute() 'observation-type': string;
  @Attribute() 'publication-date': Date;
  @Attribute() pv?: string;
  @Attribute() 'validation-status'?: string;
  @Attribute() details?: string;
  @Attribute() evidence?: string;
  @Attribute() 'concern-opinion'?: string;
  @Attribute() 'litigation-status'?: string;
  @Attribute() lat?: number;
  @Attribute() lng?: number;
  @Attribute() 'created-at'?: Date;
  @Attribute() 'updated-at'?: Date;
  @Attribute() 'actions-taken'?: string;

  @BelongsTo() fmu?: Fmu;
  @BelongsTo() law?: Law;
  @BelongsTo() country: Country;
  @BelongsTo() subcategory?: Subcategory;
  @BelongsTo() severity: Severity;
  @BelongsTo() user?: User;
  @BelongsTo() 'modified-user'?: User;
  @HasMany() observers?: Observer[]; // Should be a BelongsTo but not working with array
  @BelongsTo() operator?: Operator;
  @BelongsTo() government?: Government;
  @BelongsTo() 'observation-report'?: ObservationReport;
  @HasMany() 'relevant-operators'?: Operator[];

  @HasMany() species: Species[];
  @HasMany() comments: Comment[];
  @HasMany() photos: Photo[];
  @HasMany() documents: Document[];

}
