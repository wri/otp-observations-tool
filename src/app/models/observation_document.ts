import { Observation } from 'app/models/observation.model';
import { User } from 'app/models/user.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'observation-documents'
})
export class ObservationDocument extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() attachment: string|{ url: string };

  @BelongsTo() observation: Observation;
  @BelongsTo() user: User;

}
