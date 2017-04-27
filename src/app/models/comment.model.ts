import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
    type: 'comments'
})
export class Comment extends JsonApiModel {

  @Attribute() commentable_id: number;
  @Attribute() commentable_type: ['AnnexGovernance', 'AnnexOperator', 'Observation'];
  @Attribute() body: string;

  @BelongsTo() user: User;

}
