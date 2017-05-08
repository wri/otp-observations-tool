import { Category } from 'app/models/category.model';
import { Law } from 'app/models/law.model';
import { Severity } from 'app/models/severity.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'annex_operators'
})
export class AnnexOperator extends JsonApiModel {

  @Attribute() illegality: string;
  @Attribute() details?: string;

  @BelongsTo() country: Country;

  @HasMany() severities: Severity[];
  @HasMany() categories: Category[];
  @HasMany() laws: Law[];

}
