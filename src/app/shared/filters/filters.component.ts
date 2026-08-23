import { JsonApiParams } from 'app/services/json-api.service';
import { TranslateService } from '@ngx-translate/core';
import { DatastoreService } from 'app/services/datastore.service';
import { FilterDirective } from './directives/filter.directive';
import { Component, ContentChildren, QueryList, Output, EventEmitter, AfterContentInit, ChangeDetectionStrategy } from '@angular/core';
import { Subcategory } from '../../models/subcategory.model';
import { Government } from '../../models/government.model';
import { Operator } from '../../models/operator.model';
import { Fmu } from '../../models/fmu.model';

export interface Filter {
  name: string;
  prop: string;
  // Deliberately loose: filter values are strings for async filters and objects for
  // static ones. Narrowing this is a refactor of every caller.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  values: {};
  selected?: any;
  required: boolean;
  extraParams?: any;
  // Whether the options of the filter have to be fetched from the API
  async?: boolean;
}

@Component({
  selector: 'otp-filters',
  templateUrl: 'filters.component.html',
  styleUrls: ['filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class FiltersComponent implements AfterContentInit {

  // Props of the filters whose value narrows the options of another filter
  private static readonly CONTROLLING_PROPS = ['category-id', 'country-id', 'operator'];

  private skipNextFilterChange = false;
  private _filtersNodes: QueryList<FilterDirective>;
  private optionsLoaded = false;
  private optionsRequest: Promise<void> = null;
  // Selections in effect when the modal was opened, to be able to discard the edits made
  // in it (see onDismissModal)
  private selectionsOnOpen: Record<string, any> = {};
  previousState: JsonApiParams;
  filters: Filter[] = [];
  modalOpen = false;
  loadingOptions = false;
  objectKeys = Object.keys;
  defaultApiParams = {};

  @Output() changed = new EventEmitter<void>();

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
      // Reassigning the QueryList in a macrotask is what makes Angular pick up the
      // projected content change.
      // eslint-disable-next-line no-self-assign
      setTimeout(() => this.filtersNodes = this.filtersNodes, 0);
    });

    this.changed.subscribe(() => {
      this.onChangeFilter();
    });
  }

  private async onChangeFilter(silent = false) {
    if (this.skipNextFilterChange) {
      this.skipNextFilterChange = false;
      return;
    }

    // There's nothing to narrow before the options have been fetched, and fetching them
    // here would defeat the point of loading them lazily. ensureOptionsLoaded runs this
    // once the lists are in.
    if (this.optionsLoaded) {
      this.updateSubcategoryFilterOptions();
      this.updateGovernmentEntityFilterOptions();
      this.updateOperatorFilterOptions();
      // Must be after updateOperatorFilterOptions because the FMU options depends on the operators
      this.updateFmuFilterOptions();
    }

    if (!silent) {
      // Hack so we don't trigger an infinite loop
      this.skipNextFilterChange = true;
      this.changed.emit();
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
        const options = await this.datastoreService.findAll(Subcategory, params)
          .toPromise()
          .then((data) => data.getModels())
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
        ...(governmentEntityFilter.extraParams || {}),
        ...(this.hasValue(countryFilter)
          ? { filter: { 'country': countryFilter.selected } }
          : {}
        )
      };

      try {
        const options = await this.datastoreService.findAll(Government, params)
          .toPromise()
          .then((data) => data.getModels())
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
        ...(operatorFilter.extraParams || {}),
        ...(this.hasValue(countryFilter)
          ? { filter: { 'country': countryFilter.selected } }
          : {}
        )
      };

      try {
        const options = await this.datastoreService.findAll(Operator, params)
          .toPromise()
          .then((data) => data.getModels())
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
        ...(fmuFilter.extraParams || {}),
        filter: {
          ...(this.hasValue(countryFilter) ? { 'country': countryFilter.selected } : {}),
          ...(this.hasValue(operatorFilter) ? { 'operator': operatorFilter.selected } : {}),
        }
      };

      try {
        const options = await this.datastoreService.findAll(Fmu, params)
          .toPromise()
          .then((data) => data.getModels())
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
   */
  getApiParams(): JsonApiParams {
    const filters = this.filters
      .filter(filter => filter.selected !== null)
      .reduce((res, filter) => {
        return Object.assign({}, res, {
          [`filter[${filter.prop}]`]: filter.selected
        });
      }, {});

    return {
      ...this.defaultApiParams,
      ...filters,
    };
  }

  /**
   * Restore the state of the filters
   */
  restoreState() {
    if (!this.previousState) {
      return;
    }

    for (const key in this.previousState) {
      if (Object.prototype.hasOwnProperty.call(this.previousState, key)) {
        const filterName = key.match(/filter\[(.*)\]/)[1];
        const filterValue = this.previousState[key];
        const filter = this.filters.find(f => f.prop === filterName);
        if (filter) {
          filter.selected = filterValue;
        }
      }
    }

    // A restored value is displayed as a select outside the modal, which needs the option
    // labels to show anything but a blank. Not awaited: the table query doesn't depend on
    // the options.
    if (this.filters.some(filter => filter.async && this.hasValue(filter))) {
      this.ensureOptionsLoaded();
    }

    this.changed.emit();
  }

  async resetFilters(silent = false) {
    const filterNodes = this._filtersNodes.toArray();

    // The "sync" filters are the ones for which we don't
    // need to remotely fetch values meaning these filters
    // can be initialized right away
    const syncFiltersNodes = filterNodes.filter(f => typeof f.values !== 'string');
    const asyncFiltersNodes = filterNodes.filter(f => typeof f.values === 'string');

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
      required: syncFiltersNode.required || false,
      async: false
    }));

    // The async filters are listed with no options at all: their values are fetched only
    // once something displays them (see ensureOptionsLoaded). Listing them right away
    // still matters, because getApiParams and restoreState both work off this array.
    // We assume no async filter will have a default value.
    const asyncFilters = asyncFiltersNodes.map((asyncFiltersNode) => ({
      name: asyncFiltersNode.name,
      prop: asyncFiltersNode.prop,
      values: {},
      selected: null,
      required: asyncFiltersNode.required || false,
      extraParams: asyncFiltersNode['extra-params'],
      async: true
    }));

    this.filters = [...syncFilters, ...asyncFilters];

    // Resetting after the options have been fetched has to fetch them again: the lists of
    // the dependent filters were narrowed by the values we just cleared
    if (this.optionsLoaded) {
      await this.loadAsyncFilterOptions();
    }

    if (!silent) {
      this.changed.emit();
    }
  }

  /**
   * Fetch the options of the async filters, once.
   *
   * On a cold load nobody has opened the filters yet, so requesting a collection per async
   * filter — up to 3000 rows each — just to fill selects that stay closed delays the table
   * for nothing. The options are fetched when they first become visible instead: when the
   * user opens the filters modal, or when a restored state gives an async filter a value.
   *
   * Concurrent callers share the in-flight request.
   */
  ensureOptionsLoaded(): Promise<void> {
    if (this.optionsLoaded) {
      return Promise.resolve();
    }

    if (!this.optionsRequest) {
      this.loadingOptions = true;

      this.optionsRequest = this.loadAsyncFilterOptions()
        .then(() => {
          this.optionsLoaded = true;

          // The dependent filters (subcategory, government entity, operator and FMU) only
          // need narrowing if the filter they depend on already holds a value — otherwise
          // the lists we've just fetched are the full ones already
          const isNarrowed = this.filters.some(filter =>
            FiltersComponent.CONTROLLING_PROPS.includes(filter.prop) && this.hasValue(filter));

          if (isNarrowed) {
            return this.onChangeFilter(true);
          }
        })
        .catch(err => console.error(err)) // Otherwise the modal would spin forever
        .then(() => {
          this.loadingOptions = false;
          this.optionsRequest = null;
        });
    }

    return this.optionsRequest;
  }

  /**
   * Fetch the options of the async filters and assign them to the matching filters
   */
  private async loadAsyncFilterOptions(): Promise<void> {
    const asyncFiltersNodes = this._filtersNodes.toArray().filter(f => typeof f.values === 'string');

    const promises = asyncFiltersNodes.map((asyncFiltersNode) => {
      // The values of the filter needs to be fetched from
      // the API
      const models = Reflect.getMetadata('JsonApiDatastoreConfig', this.datastoreService.constructor).models;
      const model = models[(asyncFiltersNode.values as string)];

      const extraParams = (asyncFiltersNode.extraParams as any) || {};
      let params = {
        sort: asyncFiltersNode['name-attr'],
        page: { size: 3000 },
        // We just request the field we need
        fields: { [asyncFiltersNode.values as string]: asyncFiltersNode['name-attr'] },
        ...extraParams
      };

      if (asyncFiltersNode.prop === 'country' || asyncFiltersNode.prop === 'country-id') {
        params = Object.assign({}, params, { 'filter[is-active]': 'all' });
      }

      return this.datastoreService.findAll(model, params)
        .toPromise()
        .then((data) => data.getModels())
        .then(rows => rows.map(row => ({ [row[asyncFiltersNode['name-attr']]]: row.id })))
        .then(rows => rows.reduce((res, row) => Object.assign({}, res, row), {}));
    });

    await Promise.all(promises)
      .then(options => options.forEach((values, index) => {
        const filter = this.filters.find(f => f.prop === asyncFiltersNodes[index].prop);

        if (filter) {
          filter.values = values || {};
        }
      }))
      .catch(err => console.error(err)); // TODO: visual feedback
  }

  onOpenModal() {
    this.modalOpen = true;

    this.selectionsOnOpen = this.filters.reduce(
      (res, filter) => Object.assign(res, { [filter.prop]: filter.selected }), {});

    this.ensureOptionsLoaded();
  }

  /**
   * Dismiss the modal without applying anything (background click, close button or ESC).
   *
   * The selects write to the filters as the user picks, but nothing reaches the table
   * until "Done" — so leaving any other way has to put the selections back where they
   * were, otherwise the filters listed next to the button would claim the table is
   * filtered when it isn't.
   */
  onDismissModal() {
    this.modalOpen = false;

    const discarded = this.filters.filter(filter => filter.selected !== this.selectionsOnOpen[filter.prop]);

    if (discarded.length) {
      discarded.forEach(filter => filter.selected = this.selectionsOnOpen[filter.prop]);
      // The options of the dependent filters were narrowed by the values we just discarded
      this.onChangeFilter(true);
    }
  }

  onCancel() {
    this.modalOpen = false;
    this.resetFilters();
  }

  onDone() {
    this.modalOpen = false;
    this.changed.emit();
  }

  hasValue(filter: Filter): boolean {
    return filter.selected !== null;
  }
}
