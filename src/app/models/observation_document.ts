import { Observation } from 'app/models/observation.model';
import { ObservationReport } from 'app/models/observation_report';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'observation-documents'
})
export class ObservationDocument extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() 'document-type': string;
  @Attribute() 'observation-report-id'?: number;
  @Attribute() attachment: string|{ url: string };

  @HasMany() observations: Observation[];
  @BelongsTo() 'observation-report'?: ObservationReport;
}
