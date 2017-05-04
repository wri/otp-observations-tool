import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';

@JsonApiModelConfig({
  type: 'laws'
})
export class Law extends JsonApiModel {

  @Attribute() legal_reference: string;
  @Attribute() legal_penalty?: string;
  @Attribute() vpa_indicator?: string;

  @BelongsTo() country: Country;

}
