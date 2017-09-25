import { DatastoreService } from 'app/services/datastore.service';
import { FilterDirective } from './directives/filter.directive';
import { Component, ContentChildren, QueryList, Output, EventEmitter } from '@angular/core';

export interface Filter {
  name: string;
  prop: string;
  values: {};
  selected?: any;
  required: boolean;
}

@Component({
  selector: 'otp-filters',
  templateUrl: 'filters.component.html',
  styleUrls: ['filters.component.scss']
})
export class FiltersComponent {

  private _filtersNodes: QueryList<FilterDirective>;
  filters: Filter[] = [];
  modalOpen = false;
  objectKeys = Object.keys;

  @Output() change = new EventEmitter<void>();

  @ContentChildren(FilterDirective)
  set filtersNodes(filters: QueryList<FilterDirective>) {
    this._filtersNodes = filters;
    this.resetFilters(true);
  }

  constructor(private datastoreService: DatastoreService) {
  }

  async resetFilters(silent = false) {
    const filterNodes = this._filtersNodes.toArray();

    const promises = filterNodes.map((filter) => {
      // The values of the filter needs to be fetched from
      // the API
      if (typeof filter.values === 'string') {
        const models = Reflect.getMetadata('JsonApiDatastoreConfig', this.datastoreService.constructor).models;
        const model = models[filter.values];

        return this.datastoreService.query(model, { sort: filter['name-attr'], page: { size: 3000 } })
          .toPromise()
          .then(rows => rows.map(row => ({ [row[filter['name-attr']]]: row.id })))
          .then(rows => rows.reduce((res, row) => Object.assign({}, res, row), {}));
      }

      // The values are contained in the object and are
      // renamed to be more user friendly
      if (!Array.isArray(filter.values)) {
        return filter.values;
      }

      // The values are directly given by the template
      return filter.values.map(value => ({ [value]: value }))
        .reduce((res, value) => Object.assign({}, res, value), {});
    });

    Promise.all(promises)
      .then(p => {
        this.filters = p.map((promise, index) => ({
          name: filterNodes[index].name,
          prop: filterNodes[index].prop,
          values: promise || {},
          selected: filterNodes[index].default || null,
          required: filterNodes[index].required || false
        }));
      })
      .catch(err => console.error(err)); // TODO: visual feedback

    if (!silent) {
      this.change.emit();
    }
  }

  onCancel() {
    this.modalOpen = false;
    this.resetFilters();
  }

  onDone() {
    this.modalOpen = false;
    this.change.emit();
  }

  hasValue(filter: Filter): boolean {
    return filter.selected !== null;
  }

}
