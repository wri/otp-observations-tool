import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import { Observer } from 'app/models/observer.model';
import { Observation } from 'app/models/observation.model';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'observation-reports'
})
export class ObservationReport extends JsonApiModel {

  @Attribute() title: string;
  @Attribute() attachment: string|{ url: string };
  @Attribute() 'publication-date': Date;

  @BelongsTo() user: User;
  @HasMany() observers: Observer[];

}
