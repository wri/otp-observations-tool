import { FilterDirective } from './directives/filter.directive';
import { Component, ContentChildren, QueryList, Output, EventEmitter } from '@angular/core';

export interface Filter {
  name: string;
  prop: string;
  values: (string|number|boolean)[];
  selected?: string|number|boolean;
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

  @Output() change = new EventEmitter<void>();

  @ContentChildren(FilterDirective)
  set filtersNodes(filters: QueryList<FilterDirective>) {
    this._filtersNodes = filters;
    this.resetFilters(true);
  }

  resetFilters(silent = false) {
    this.filters = this._filtersNodes.toArray().map(filter => ({
      name: filter.name,
      prop: filter.prop,
      values: filter.values || [],
      selected: filter.default || '',
      required: filter.required || false,
      visible: filter.required || false
    }));

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
    if (typeof filter.selected === 'string') {
      return !!filter.selected.length;
    }

    return filter.selected !== undefined && filter.selected !== null;
  }

}
