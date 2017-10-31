import { TranslateService } from '@ngx-translate/core';
import { DatastoreService } from 'app/services/datastore.service';
import { FilterDirective } from './directives/filter.directive';
import { Component, ContentChildren, QueryList, Output, EventEmitter, AfterContentInit } from '@angular/core';

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
export class FiltersComponent implements AfterContentInit {

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

  get filtersNodes(): QueryList<FilterDirective> {
    return this._filtersNodes;
  }

  constructor(
    private datastoreService: DatastoreService,
    private translateService: TranslateService
  ) {}

  ngAfterContentInit(): void {
    // Angular doesn't detect the changes of the attributes of
    // the columns so we need to listen to the language changes
    // to force the columns to be re-rendered
    this.translateService.onLangChange.subscribe((lang) => {
      // Also, when the event is triggered, the language is not
      // already changed, so we need to sligthly delay the render
      setTimeout(() => this.filtersNodes = this.filtersNodes, 0);
    });
  }

  async resetFilters(silent = false) {
    const filterNodes = this._filtersNodes.toArray();

    const promises = filterNodes.map((filter) => {
      // The values of the filter needs to be fetched from
      // the API
      if (typeof filter.values === 'string') {
        const models = Reflect.getMetadata('JsonApiDatastoreConfig', this.datastoreService.constructor).models;
        const model = models[filter.values];

        let params = { sort: filter['name-attr'], page: { size: 3000 } };
        console.log(filter.prop);

        if (filter.prop === 'country' || filter.prop === 'country-id') {
          params = Object.assign({}, params, { 'filter[is-active]': 'all'});
        }

        return this.datastoreService.query(model, params)
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
