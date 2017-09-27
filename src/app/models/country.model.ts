import { Government } from 'app/models/government.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'countries'
})
export class Country extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() iso: string;
  @Attribute() region_iso?: string;
  @Attribute() region_name?: string;
  @Attribute() country_centroid?: any;
  @Attribute() region_centroid?: any;
  @Attribute() is_active?: boolean;
}
