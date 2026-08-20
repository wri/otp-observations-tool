import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from '@michalkotas/angular2-jsonapi';
import type { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'documents'
})
export class Document extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() document_type: ['Report', 'Documentation'];
  @Attribute() attachement: string;

  @BelongsTo() user: User;

}
