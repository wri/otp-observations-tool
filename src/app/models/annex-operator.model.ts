import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'annex_operators'
})
export class AnnexOperator extends JsonApiModel {

  @Attribute() illegality: string;
  @Attribute() details?: string;

  @BelongsTo() country: Country;

}
