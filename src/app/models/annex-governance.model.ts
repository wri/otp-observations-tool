import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany, BelongsTo } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { User } from 'app/models/user.model';
import { Comment } from 'app/models/comment.model';
import { Category } from 'app/models/category.model';
import { Severity } from 'app/models/severity.model';

@JsonApiModelConfig({
  type: 'annex_governances'
})
export class AnnexGovernance extends JsonApiModel {

  @Attribute() governance_pillar: string;
  @Attribute() governance_problem: string;
  @Attribute() details?: string;

  @BelongsTo() country: Country;

  @HasMany() severities: Severity[];
  @HasMany() categories: Category[];
  @HasMany() comments: Comment[];

}
