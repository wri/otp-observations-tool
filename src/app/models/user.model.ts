import { Observer } from 'app/models/observer.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { UserPermission } from 'app/models/user_permission.model';

@JsonApiModelConfig({
  type: 'users'
})
export class User extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() 'first-name': string;
  @Attribute() 'last-name': string;
  @Attribute() email: string;
  @Attribute() institution?: string;
  @Attribute() is_active?: boolean;
  @Attribute() locale?: string;
  @Attribute() deactivated_at?: Date;
  @Attribute() password?: string;
  @Attribute() 'password-confirmation'?: string;
  @Attribute() 'current-password'?: string;
  @Attribute() 'organization-account': boolean

  @BelongsTo() country: Country;
  @BelongsTo() observer: Observer;
}
