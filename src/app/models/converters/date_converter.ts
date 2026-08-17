// Deep imports: the 'date-fns' barrel pulls all 164 modules into the eager bundle.
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import { PropertyConverter } from 'angular2-jsonapi';

export class DateConverter implements PropertyConverter {
  mask(value: any) {
    if (typeof value === 'string') {
      return parse(value);
    } else {
      return value;
    }
  }

  unmask(value: any) {
    if (value === null) {
      return null;
    }
    return format(value, 'YYYY-MM-DDTHH:mm:ssZ');
  }
}
