import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from '@michalkotas/angular2-jsonapi';
import type { Country } from 'app/models/country.model';

@JsonApiModelConfig({
  type: 'governments'
})
export class Government extends JsonApiModel {

  @Attribute() 'government-entity': string;
  @Attribute() details?: string;

  @BelongsTo() country: Country;

}
