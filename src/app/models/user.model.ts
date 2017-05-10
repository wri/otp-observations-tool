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
  @Attribute() deactivated_at?: Date;

  @BelongsTo() country: Country;
  @BelongsTo() user_permission: UserPermission;

}
