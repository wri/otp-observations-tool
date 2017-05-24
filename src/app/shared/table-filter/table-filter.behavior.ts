import { ViewChild, AfterViewInit } from '@angular/core';
import { JsonApiParams, JsonApiService } from 'app/services/json-api.service';
import { TableComponent, TableState } from 'app/shared/table/table.component';

export class TableFilterBehavior implements AfterViewInit {

  private latestRequestID = 0;
  protected service: JsonApiService<any>;

  @ViewChild(TableComponent)
  private table: TableComponent;

  private get tableState(): TableState {
    return this.table.state;
  }

  ngAfterViewInit(): void {
    this.table.change.subscribe(() => this.loadData());
    this.loadData();
  }

  public getTableApiParams(): JsonApiParams {
    const params: JsonApiParams = {
      page: {
        size: this.tableState.perPage,
        number: this.tableState.page
      }
    };

    if (this.tableState.sortColumn) {
      params.sort = `${this.tableState.sortOrder < 0 ? '-' : ''}${this.tableState.sortColumn}`;
    }

    return params;
  }

  public loadData() {
    this.table.loading = true;

    const requestID = ++this.latestRequestID;
    this.service.get(this.getTableApiParams())
      .then(res => {
        if (this.latestRequestID === requestID) {
          this.table.rows = res.data;
          this.table.rowCount = res.meta.total_items;
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
