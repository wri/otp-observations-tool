import { JsonApiModel, JsonApiModelConfig, Attribute } from '@michalkotas/angular2-jsonapi';

@JsonApiModelConfig({
  type: 'categories'
})
export class Category extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() 'category-type': string;

}
