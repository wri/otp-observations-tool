import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany, BelongsTo } from 'angular2-jsonapi';
import { Category } from 'app/models/category.model';
import { Severity } from 'app/models/severity.model';

@JsonApiModelConfig({
  type: 'subcategories'
})
export class Subcategory extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() details: string;
  @Attribute() 'location-required': boolean;
  @HasMany() severities: Severity[];

  @BelongsTo() category: Category;
}
