import { Operator } from 'app/models/operator.model';
import { Country } from './country.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'fmus'
})
export class Fmu extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() geojson: object;

  @BelongsTo() country: Country;
  @BelongsTo() operator: Operator;
}
