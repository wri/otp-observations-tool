import { JsonApiModel, JsonApiModelConfig, Attribute } from '@michalkotas/angular2-jsonapi';

@JsonApiModelConfig({
    type: 'user_permissions'
})
export class UserPermission extends JsonApiModel {

  @Attribute() user_role: 'user'|'operator'|'ngo'|'admin';

}
