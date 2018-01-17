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

  public loadData() {
    this.table.loading = true;

    const params = Object.assign({}, this.filters.getApiParams(), this.table.getApiParams());
    const requestID = ++this.latestRequestID;

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

}
