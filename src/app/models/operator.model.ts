import { JsonApiModel, JsonApiModelConfig, Attribute, BelongsTo, HasMany } from 'angular2-jsonapi';
import { Fmu } from 'app/models/fmu.model';
import { Country } from 'app/models/country.model';

export enum OperatorTypes {
  'Artisanal' = 'Artisanal',
  'Community forest' = 'Community forest',
  'Estate' = 'Estate',
  'Industrial agriculture' = 'Industrial agriculture',
  'Logging company' = 'Logging company',
  'Mining company' = 'Mining company',
  'Other' = 'Other',
  'Sawmill' = 'Sawmill',
  'Unknown' = 'Unknown'
}

@JsonApiModelConfig({
  type: 'operators'
})
export class Operator extends JsonApiModel {

  @Attribute() name: string;
  @Attribute() 'operator-type'?: string;
  @Attribute() logo?: any;
  @Attribute() details?: string;
  @Attribute() address?: string;
  @Attribute() website?: string;

  @BelongsTo() country: Country;

  @HasMany() fmus: Fmu[];
}
