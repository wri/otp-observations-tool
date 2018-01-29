import { ViewChild, AfterViewInit } from '@angular/core';
import { JsonApiParams, JsonApiService } from 'app/services/json-api.service';
import { TableComponent, TableState } from 'app/shared/table/table.component';
import { FiltersComponent, Filter } from 'app/shared/filters/filters.component';

export class TableFilterBehavior implements AfterViewInit {

  private latestRequestID = 0;
  protected service: JsonApiService<any>;

  @ViewChild(TableComponent)
  protected table: TableComponent;

  @ViewChild(FiltersComponent)
  protected filters: FiltersComponent;

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
    setTimeout(() => this.restoreState(), 0);
  }

  public loadData() {
    this.table.loading = true;

    const params = Object.assign({}, this.filters.getApiParams(), this.table.getApiParams());
    const requestID = ++this.latestRequestID;

    // We save the current state of the table and
    // filters so the user can come back to them
    // later
    this.saveState();

    this.service.get(params)
      .then(res => {
        if (this.latestRequestID === requestID) {
          this.table.rows = res.data;
          this.table.rowCount = res.meta['record-count'];
        }
      })
      .catch(() => console.error('Error loading the table data'))
      .then(() => {
        if (this.latestRequestID === requestID) {
          this.table.loading = false;
        }
      });
  }

  /**
   * Save the state of the table and the filters
   * in the session storage
   */
  saveState() {
    const typeName: string = Reflect.getMetadata('JsonApiModelConfig', this.service.model).type;
    const params = Object.assign({}, { filters: this.filters.getApiParams() }, { table: this.table.getApiParams() });
    sessionStorage.setItem('tableFilter', JSON.stringify({ [typeName]: params }));
  }

  /**
   * Restore the state of the table and filters
   * frop the session storage if it corresponds
   * to the current table
   */
  restoreState() {
    const typeName: string = Reflect.getMetadata('JsonApiModelConfig', this.service.model).type;
    let params;

    try {
      params = JSON.parse(sessionStorage.getItem('tableFilter'));
    } catch (err) {
      // If we fail to get the previous state, we just
      // delete it
      sessionStorage.removeItem('tableFilter');
    }

    // We won't have params the first time we load
    // the app, if the params are for another table
    // or if we fail to retrieve them
    if (!params || Object.keys(params)[0] !== typeName) {
      this.loadData();
      return;
    }

    // We only restore the state if it corresponds to
    // the current table
    const { table: tableParams, filters: filtersParams } = params[typeName];
    this.filters.previousState = filtersParams;
    this.table.previousState = tableParams;

    this.filters.restoreState();
    this.table.restoreState();
  }

}
