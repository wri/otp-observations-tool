import { Observer } from 'app/models/observer.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { UserPermission } from 'app/models/user_permission.model';

@JsonApiModelConfig({
  type: 'users'
})
export class User extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() email: string;
  @Attribute() nickname: string;
  @Attribute() institution?: string;
  @Attribute() is_active?: boolean;
  @Attribute() 'public-info'?: boolean;
  @Attribute() deactivated_at?: Date;
  @Attribute() password?: string;
  @Attribute() 'password-confirmation'?: string;

  @BelongsTo() country: Country;
  @BelongsTo() observer: Observer;

}
