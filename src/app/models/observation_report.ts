import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import { Observer } from 'app/models/observer.model';
import { Observation } from 'app/models/observation.model';
import { User } from 'app/models/user.model';
import { DateConverter } from './converters/date_converter';

@JsonApiModelConfig({
  type: 'observation-reports'
})
export class ObservationReport extends JsonApiModel {

  @Attribute() title: string;
  @Attribute() attachment: string|{ url: string };
  @Attribute({ converter: new DateConverter() }) 'publication-date': Date;

  @BelongsTo() user: User;
  @HasMany() observers: Observer[];

}
