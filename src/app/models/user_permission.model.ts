import { JsonApiModel, JsonApiModelConfig, Attribute } from 'angular2-jsonapi';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
    type: 'user_permissions'
})
export class UserPermission extends JsonApiModel {

  @Attribute() user_role: 'user'|'operator'|'ngo'|'admin';

}
