import { Subcategory } from 'app/models/subcategory.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany, BelongsTo } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'severities'
})
export class Severity extends JsonApiModel {

  @Attribute() level: number;
  @Attribute() details: string;

  @BelongsTo() subcategory: Subcategory;

}
