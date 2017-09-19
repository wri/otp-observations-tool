import { User } from 'app/models/user.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'observation-reports'
})
export class ObservationReport extends JsonApiModel {

  @Attribute() title: string;
  @Attribute() attachment: string|{ url: string };
  @Attribute() 'publication-date': Date;

  @BelongsTo() user: User;

}
