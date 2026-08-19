import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import type { Observer } from 'app/models/observer.model';
import type { Observation } from 'app/models/observation.model';
import { DateConverter } from './converters/date_converter';

export const MISSION_TYPES = ['mandated', 'semi_mandated', 'external'];
export type MissionType = typeof MISSION_TYPES[number];

@JsonApiModelConfig({
  type: 'observation-reports'
})
export class ObservationReport extends JsonApiModel {

  @Attribute() title: string;
  @Attribute() attachment: string|{ url: string };
  @Attribute({ converter: new DateConverter() }) 'publication-date': Date;
  @Attribute() 'mission-type': MissionType;

  @HasMany() observers: Observer[];
  @HasMany() observations: Observation[];

}
