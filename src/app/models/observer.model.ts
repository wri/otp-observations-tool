import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'observers'
})
export class Observer extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() 'observer-type'?: ['Mandated', 'SemiMandated', 'External', 'Government'];
  @Attribute() 'organization-type'?: ['NGO', 'Academic', 'Research Institute', 'Private Company', 'Other'];
  @Attribute() is_active?: boolean;
  @Attribute() logo?: string;
  @Attribute() address?: string;
  @Attribute() 'information-name'?: string;
  @Attribute() 'information-email'?: string;
  @Attribute() 'information-phone'?: string;
  @Attribute() 'data-name'?: string;
  @Attribute() 'data-email'?: string;
  @Attribute() 'data-phone'?: string;

  @BelongsTo() users: User[];

  @HasMany() countries: Country[];

}
