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
import { AnnexOperator } from 'app/models/annex-operator.model';
import { AnnexGovernance } from 'app/models/annex-governance.model';
import { Severity } from 'app/models/severity.model';

@JsonApiModelConfig({
    type: 'observations'
})
export class Observation extends JsonApiModel {

  @Attribute() observation_type: string;
  @Attribute() publication_date: Date;
  @Attribute() pv?: string;
  @Attribute() is_active?: boolean;
  @Attribute() details?: string;
  @Attribute() evidence?: string;
  @Attribute() concern_opinion?: string;
  @Attribute() litigation_status?: string;
  @Attribute() lat?: string;
  @Attribute() lng?: string;

  @BelongsTo() country: Country;
  @BelongsTo() annex_operator?: AnnexOperator;
  @BelongsTo() annex_governance?: AnnexGovernance;
  @BelongsTo() severity: Severity;
  @BelongsTo() user?: User;
  @BelongsTo() observer?: Observer;
  @BelongsTo() operator?: Operator;
  @BelongsTo() government?: Government;

  @HasMany() species: Species[];
  @HasMany() comments: Comment[];
  @HasMany() photos: Photo[];
  @HasMany() documents: Document[];

}
