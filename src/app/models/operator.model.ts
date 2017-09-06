import { Fmu } from 'app/models/fmu.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { User } from 'app/models/user.model';

@JsonApiModelConfig({
  type: 'operators'
})
export class Operator extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() operator_type?: ['Logging Company', 'Artisanal', 'Sawmill', 'CommunityForest', 'ARB1327', 'PalmOil', 'Trader', 'Company'];
  @Attribute() concession?: string;
  @Attribute() is_active?: boolean;
  @Attribute() logo?: any;
  @Attribute() details?: string;

  @HasMany() fmus: Fmu[];
  @BelongsTo() country: Country;
  @BelongsTo() users: User[];

}
