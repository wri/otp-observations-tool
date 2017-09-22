import { ViewChild, AfterViewInit } from '@angular/core';
import { JsonApiParams, JsonApiService } from 'app/services/json-api.service';
import { TableComponent, TableState } from 'app/shared/table/table.component';
import { FiltersComponent, Filter } from 'app/shared/filters/filters.component';

export class TableFilterBehavior implements AfterViewInit {

  private latestRequestID = 0;
  protected service: JsonApiService<any>;

  @ViewChild(TableComponent)
  private table: TableComponent;

  @ViewChild(FiltersComponent)
  private filters: FiltersComponent;

  private get tableState(): TableState {
    return this.table.state;
  }

  private get filtersState(): Filter[] {
    return this.filters.filters || [];
  }

  ngAfterViewInit(): void {
    this.table.change.subscribe(() => this.loadData());
    this.filters.change.subscribe(() => {
      // We don't forget to move the user to the first
      // page of results each time a filter changes
      this.table.paginationIndex = 0;

      this.loadData();
    });
    // Need to be asynchronous:
    // https://github.com/angular/angular/issues/17572#issuecomment-323645870
    setTimeout(() => this.loadData(), 0);
  }

  getTableApiParams(): JsonApiParams {
    const params: JsonApiParams = {
      page: {
        size: this.tableState.perPage,
        number: this.tableState.page
      }
    };

    if (this.tableState.include.length) {
      params.include = this.tableState.include.join(',');
    }

    if (this.tableState.sortColumn) {
      params.sort = `${this.tableState.sortOrder < 0 ? '-' : ''}${this.tableState.sortColumn}`;
    }

    return params;
  }

  getFiltersApiParams(): JsonApiParams {
    return this.filtersState
      .filter(filter => {
        if (typeof filter.selected === 'string') {
          return !!filter.selected.length;
        }

        return filter.selected !== undefined && filter.selected !== null;
      })
      .reduce((res, filter) => {
        return Object.assign({}, res, {
          [`filter[${filter.prop}]`]: filter.selected
        });
      }, {});
  }

  public loadData() {
    this.table.loading = true;

    const params = Object.assign({}, this.getFiltersApiParams(), this.getTableApiParams());
    const requestID = ++this.latestRequestID;

    this.service.get(params)
      .then(res => {
        if (this.latestRequestID === requestID) {
          this.table.rows = res.data;
          this.table.rowCount = res.meta['record-count'];
        }
      })
      .catch(() => console.log('Error loading the table data'))
      .then(() => {
        if (this.latestRequestID === requestID) {
          this.table.loading = false;
        }
      });
  }

}
