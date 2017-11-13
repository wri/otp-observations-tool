import { Country } from 'app/models/country.model';
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
  @Attribute() currency: string;
  @Attribute() 'other-penalties': string;
  @Attribute() 'penal-servitude': string;
  @Attribute() sanctions: string;
  @Attribute() 'written-infraction': string;
  @Attribute() complete: boolean;

  @BelongsTo() subcategory: Subcategory;
  @BelongsTo() country: Country;

}
