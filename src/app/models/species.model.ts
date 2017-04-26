import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';

@JsonApiModelConfig({
  type: 'species'
})
export class Species extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() common_name?: string;
  @Attribute() species_class?: string;
  @Attribute() sub_species?: string;
  @Attribute() species_family?: string;
  @Attribute() species_kingdom?: string;
  @Attribute() scientific_name?: string;
  @Attribute() cites_status?: string;
  @Attribute() cites_id?: number;
  @Attribute() iucn_status?: number;

  @HasMany() countries: Country[];

}
