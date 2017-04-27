import { JsonApiModel, JsonApiModelConfig, Attribute, HasMany } from 'angular2-jsonapi';
import { AnnexGovernance } from 'app/models/annex-governance.model';
import { AnnexOperator } from 'app/models/annex-operator.model';

@JsonApiModelConfig({
  type: 'categories'
})
export class Category extends JsonApiModel {

  @Attribute() name: string;

  @HasMany() annex_governances: AnnexGovernance[];
  @HasMany() annex_operators: AnnexOperator[];

}
