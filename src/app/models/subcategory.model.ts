import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'subcategories'
})
export class Subcategory extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() details: string;

}
