import { Observation } from 'app/models/observation.model';
import { ObservationReport } from 'app/models/observation_report';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'observation-documents'
})
export class ObservationDocument extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() 'document-type': string;
  @Attribute() attachment: string|{ url: string };

  @BelongsTo() observation: Observation;
  @BelongsTo() 'observation-report'?: ObservationReport;
}
