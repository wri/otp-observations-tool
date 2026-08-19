import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany } from 'angular2-jsonapi';
import type { Subcategory } from 'app/models/subcategory.model';

@JsonApiModelConfig({
  type: 'categories'
})
export class Category extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() 'category-type': string;

}
