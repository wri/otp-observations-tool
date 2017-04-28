import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'observers'
})
export class Observer extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() observer_type?: ['Mandated', 'SemiMandated', 'External', 'Government'];
  @Attribute() organization?: string;
  @Attribute() is_active?: boolean;
  @Attribute() logo?: any;

  @BelongsTo() country: Country;
  @BelongsTo() users: User[];

}
