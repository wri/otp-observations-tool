import { Subcategory } from 'app/models/subcategory.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'laws'
})
export class Law extends JsonApiModel {

  @Attribute() apv: string;
  @Attribute() infraction: string;
  @Attribute() 'max-fine': number;
  @Attribute() 'min-fine': number;
  @Attribute() 'other-penalties': string;
  @Attribute() 'penal-servitude': string;
  @Attribute() sanctions: string;
  @Attribute() 'written-infraction': string;

  @BelongsTo() subcategory: Subcategory;

}
