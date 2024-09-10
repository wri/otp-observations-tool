import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany, BelongsTo } from 'angular2-jsonapi';
import { Observation } from 'app/models/observation.model';

@JsonApiModelConfig({
  type: 'quality-controls'
})
export class QualityControl extends JsonApiModel {
  @BelongsTo() reviewable: Observation;

  @Attribute() comment?: string;
  @Attribute() passed?: boolean;
  @Attribute() 'created-at'?: Date;
}
