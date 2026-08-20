import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany, BelongsTo } from '@michalkotas/angular2-jsonapi';
import type { Observation } from 'app/models/observation.model';

@JsonApiModelConfig({
  type: 'quality-controls'
})
export class QualityControl extends JsonApiModel {
  @BelongsTo() reviewable: Observation;

  @Attribute() comment?: string;
  @Attribute() passed?: boolean;
  @Attribute() decision?: string;
  @Attribute() 'created-at'?: Date;
}
