import { JsonApiParams } from 'app/services/json-api.service';
import { TranslateService } from '@ngx-translate/core';
import { DatastoreService } from 'app/services/datastore.service';
import { FilterDirective } from './directives/filter.directive';
import { Component, ContentChildren, QueryList, Output, EventEmitter, AfterContentInit } from '@angular/core';
import { Subcategory } from '../../models/subcategory.model';
import { Government } from '../../models/government.model';
import { Operator } from '../../models/operator.model';
import { Fmu } from '../../models/fmu.model';

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

  private skipNextFilterChange = false;
  private _filtersNodes: QueryList<FilterDirective>;
  previousState: JsonApiParams;
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
  ) { }

  ngAfterContentInit(): void {
    // Angular doesn't detect the changes of the attributes of
    // the columns so we need to listen to the language changes
    // to force the columns to be re-rendered
    this.translateService.onLangChange.subscribe((lang) => {
      // Also, when the event is triggered, the language is not
      // already changed, so we need to sligthly delay the render
      setTimeout(() => this.filtersNodes = this.filtersNodes, 0);
    });

    this.change.subscribe(() => {
      this.onChangeFilter();
    });
  }

  private async onChangeFilter(silent = false) {
    if (this.skipNextFilterChange) {
      this.skipNextFilterChange = false;
      return;
    }

    this.updateSubcategoryFilterOptions();
    this.updateGovernmentEntityFilterOptions();
    this.updateOperatorFilterOptions();
    // Must be after updateOperatorFilterOptions because the FMU options depends on the operators
    this.updateFmuFilterOptions();

    if (!silent) {
      // Hack so we don't trigger an infinite loop
      this.skipNextFilterChange = true;
      this.change.emit();
    }
  }

  private async updateSubcategoryFilterOptions() {
    const categoryFilter = this.filters.find(filter => filter.prop === 'category-id');
    const subcategoryFilter = this.filters.find(filter => filter.prop === 'subcategory');

    if (categoryFilter && subcategoryFilter) {
      // If the user filters by category, we need to filter the subcategories
      // If the user removes the category filter, we need to fetch all the subcategories again
      const params = {
        sort: 'name',
        page: { size: 3000 },
        // We just request the field we need
        fields: { subcategories: 'name' },
        ...(this.hasValue(categoryFilter)
          ? { filter: { 'category-id': categoryFilter.selected } }
          : {}
        )
      };

      try {
        const options = await this.datastoreService.query(Subcategory, params)
          .toPromise()
          .then(rows => rows.map(row => ({ [row.name]: row.id })))
          .then(rows => rows.reduce((res, row) => Object.assign({}, res, row), {}));

        subcategoryFilter.values = options;
        if (this.hasValue(categoryFilter) && this.hasValue(subcategoryFilter)) {
          const option = Object.keys(options).find(key => options[key] === subcategoryFilter.selected);
          if (!option) {
            subcategoryFilter.selected = null;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async updateGovernmentEntityFilterOptions() {
    const countryFilter = this.filters.find(filter => filter.prop === 'country-id');
    const governmentEntityFilter = this.filters.find(filter => filter.prop === 'government-id');

    if (countryFilter && governmentEntityFilter) {
      // If the user filters by country, we need to filter the government entities
      // If the user removes the country filter, we need to fetch all the government entities again
      const params = {
        sort: 'government-entity',
        page: { size: 3000 },
        // We just request the field we need
        fields: { governments: 'government-entity' },
        ...(this.hasValue(countryFilter)
          ? { filter: { 'country': countryFilter.selected } }
          : {}
        )
      };

      try {
        const options = await this.datastoreService.query(Government, params)
          .toPromise()
          .then(rows => rows.map(row => ({ [row['government-entity']]: row.id })))
          .then(rows => rows.reduce((res, row) => Object.assign({}, res, row), {}));

        governmentEntityFilter.values = options;
        if (this.hasValue(countryFilter) && this.hasValue(governmentEntityFilter)) {
          const option = Object.keys(options).find(key => options[key] === governmentEntityFilter.selected);
          if (!option) {
            governmentEntityFilter.selected = null;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async updateOperatorFilterOptions() {
    const countryFilter = this.filters.find(filter => filter.prop === 'country-id');
    const operatorFilter = this.filters.find(filter => filter.prop === 'operator');

    if (countryFilter && operatorFilter) {
      // If the user filters by country, we need to filter the operators
      // If the user removes the country filter, we need to fetch all the operators again
      const params = {
        sort: 'name',
        page: { size: 3000 },
        // We just request the field we need
        fields: { operators: 'name' },
        ...(this.hasValue(countryFilter)
          ? { filter: { 'country': countryFilter.selected } }
          : {}
        )
      };

      try {
        const options = await this.datastoreService.query(Operator, params)
          .toPromise()
          .then(rows => rows.map(row => ({ [row.name]: row.id })))
          .then(rows => rows.reduce((res, row) => Object.assign({}, res, row), {}));

        operatorFilter.values = options;
        if (this.hasValue(countryFilter) && this.hasValue(operatorFilter)) {
          const option = Object.keys(options).find(key => options[key] === operatorFilter.selected);
          if (!option) {
            operatorFilter.selected = null;
            // The FMUs depend on the operators so if the country resets the operator, the FMU
            // must be updated too
            this.onChangeFilter(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async updateFmuFilterOptions() {
    const countryFilter = this.filters.find(filter => filter.prop === 'country-id');
    const operatorFilter = this.filters.find(filter => filter.prop === 'operator');
    const fmuFilter = this.filters.find(filter => filter.prop === 'fmu-id');

    if (countryFilter && operatorFilter && fmuFilter) {
      // If the user filters by country and/or operator, we need to filter the fmus
      // If the user removes the country and/or operator filter, we need to fetch all the fmus again
      const params = {
        sort: 'name',
        page: { size: 3000 },
        // We just request the field we need
        fields: { fmus: 'name' },
        filter: {
          ...(this.hasValue(countryFilter) ? { 'country': countryFilter.selected } : {}),
          ...(this.hasValue(operatorFilter) ? { 'operator': operatorFilter.selected } : {}),
        }
      };

      try {
        const options = await this.datastoreService.query(Fmu, params)
          .toPromise()
          .then(rows => rows.map(row => ({ [row.name]: row.id })))
          .then(rows => rows.reduce((res, row) => Object.assign({}, res, row), {}));

        fmuFilter.values = options;
        if ((this.hasValue(countryFilter) || this.hasValue(operatorFilter)) && this.hasValue(fmuFilter)) {
          const option = Object.keys(options).find(key => options[key] === fmuFilter.selected);
          if (!option) {
            fmuFilter.selected = null;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Return the params for the API calls
   * NOTE: overriden in the report library
   */
  getApiParams(): JsonApiParams {
    return this.filters
      .filter(filter => filter.selected !== null)
      .reduce((res, filter) => {
        return Object.assign({}, res, {
          [`filter[${filter.prop}]`]: filter.selected
        });
      }, {});
  }

  /**
   * Restore the state of the filters
   */
  restoreState() {
    if (!this.previousState) {
      return;
    }

    for (const key in this.previousState) {
      if (this.previousState.hasOwnProperty(key)) {
        const filterName = key.match(/filter\[(.*)\]/)[1];
        const filterValue = this.previousState[key];
        const filter = this.filters.find(f => f.prop === filterName);
        if (filter) {
          filter.selected = filterValue;
        }
      }
    }

    this.change.emit();
  }

  async resetFilters(silent = false) {
    const filterNodes = this._filtersNodes.toArray();

    // The "sync" filters are the ones for which we don't
    // need to remotely fetch values meaning these filters
    // can be initialized right away
    const syncFiltersNodes = filterNodes.filter(f => typeof f.values !== 'string');
    const asyncFiltersNodes = filterNodes.filter(f => typeof f.values === 'string');

    // In a first step, we set these sync filters so the
    // table automatically load the table with these
    // We assume no async filter will have a default value
    const syncFilters = syncFiltersNodes.map((syncFiltersNode) => ({
      name: syncFiltersNode.name,
      prop: syncFiltersNode.prop,
      values: !Array.isArray(syncFiltersNode.values)
        ? (syncFiltersNode.values)
        : syncFiltersNode.values
          .map(value => ({ [value]: value }))
          .reduce((res, value) => Object.assign({}, res, value), {}),
      selected: syncFiltersNode.default !== null && syncFiltersNode.default !== undefined
        ? syncFiltersNode.default
        : null,
      required: syncFiltersNode.required || false
    }));

    this.filters = syncFilters;

    // Then we fetch the values of the async filters and
    // reset the filters with the combination of the sync
    // and async ones
    const promises = asyncFiltersNodes.map((asyncFiltersNode) => {
      // The values of the filter needs to be fetched from
      // the API
      const models = Reflect.getMetadata('JsonApiDatastoreConfig', this.datastoreService.constructor).models;
      const model = models[<string>asyncFiltersNode.values];

      let params = {
        sort: asyncFiltersNode['name-attr'],
        page: { size: 3000 },
        // We just request the field we need
        fields: { [<string>asyncFiltersNode.values]: asyncFiltersNode['name-attr'] }
      };

      if (asyncFiltersNode.prop === 'country' || asyncFiltersNode.prop === 'country-id') {
        params = Object.assign({}, params, { 'filter[is-active]': 'all' });
      }

      return this.datastoreService.query(model, params)
        .toPromise()
        .then(rows => rows.map(row => ({ [row[asyncFiltersNode['name-attr']]]: row.id })))
        .then(rows => rows.reduce((res, row) => Object.assign({}, res, row), {}));
    });

    Promise.all(promises)
      .then(p => {
        this.filters = [
          ...syncFilters,
          ...p.map((promise, index) => ({
            name: asyncFiltersNodes[index].name,
            prop: asyncFiltersNodes[index].prop,
            values: promise || {},
            selected: asyncFiltersNodes[index].default || null,
            required: asyncFiltersNodes[index].required || false
          }))
        ];
      })
      .then(() => this.restoreState())
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
