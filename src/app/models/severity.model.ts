import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'severities'
})
export class Severity extends JsonApiModel {

  @Attribute() level: number;
  @Attribute() details: string;

}
