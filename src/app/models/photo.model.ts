import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'photos'
})
export class Photo extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() attachement: string;

  @BelongsTo() user: User;

}
