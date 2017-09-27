import { Fmu } from 'app/models/fmu.model';
import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import { Country } from 'app/models/country.model';
import { User } from 'app/models/user.model';
import { OperatorTypes } from 'app/pages/fields/operators/operator-list.component';

@JsonApiModelConfig({
  type: 'operators'
})
export class Operator extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() 'operator-type'?: string;
  @Attribute() logo?: any;
  @Attribute() details?: string;
  @Attribute() concession?: string;
  @Attribute() address?: string;
  @Attribute() website?: string;

  @BelongsTo() country: Country;

}
