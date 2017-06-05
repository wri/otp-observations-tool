import { FilterDirective } from './directives/filter.directive';
import { Component, ContentChildren, QueryList } from '@angular/core';

export interface Filter {
  name: string;
  prop: string;
  values: string[];
  selected?: string;
  required: boolean;
  visible: boolean;
}

@Component({
  selector: 'otp-filters',
  templateUrl: 'filters.component.html',
  styleUrls: ['filters.component.scss']
})
export class FiltersComponent {

  private _filtersNodes: QueryList<FilterDirective>;
  filters: Filter[];
  modalOpen = false;

  @ContentChildren(FilterDirective)
  set filtersNodes(filters: QueryList<FilterDirective>) {
    this._filtersNodes = filters;
    this.resetFilters();
  }

  resetFilters() {
    this.filters = this._filtersNodes.toArray().map(filter => ({
      name: filter.name,
      prop: filter.prop,
      values: filter.values || [],
      selected: filter.default || undefined,
      required: filter.required || false,
      visible: filter.required || false
    }));
  }

  onCancel() {
    this.modalOpen = false;
    this.resetFilters();
  }

}
