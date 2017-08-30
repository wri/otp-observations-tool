import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany } from 'angular2-jsonapi';
import { Severity } from 'app/models/severity.model';

@JsonApiModelConfig({
  type: 'subcategories'
})
export class Subcategory extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() details: string;
  @HasMany() severities: Severity[];
}
