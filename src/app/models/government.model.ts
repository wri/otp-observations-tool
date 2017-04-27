import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'governments'
})
export class Government extends JsonApiModel {

  @Attribute() government_entity: string;
  @Attribute() details?: string;

  @BelongsTo() country: Country;

}
