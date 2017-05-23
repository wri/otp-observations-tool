import { Component, Input, QueryList, ContentChildren } from '@angular/core';
import { TableColumnDirective } from 'app/shared/table/directives/column/column.directive';

@Component({
  selector: 'otp-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {

  @Input() rows: any[];
  @Input() rowCount: number; // Number of total rows (total results)
  @Input() caption: string;
  @Input() perPage = 10;

  columns: any[] = [];
  sortColumn: any; // Column used for sorting the table
  sortOrder: 'asc'|'desc'; // Sort order

  private _columnTemplates: QueryList<TableColumnDirective>;
  private _paginationIndex = 0; // Zero-based number of the page

  @ContentChildren(TableColumnDirective)
  set columnTemplates(list: QueryList<TableColumnDirective>) {
    this._columnTemplates = list;

    if (list) {
      const templates = list.toArray();

      if (templates.length) {
        this.columns = [];
        for (const template of templates) {
          const column = <any>{};

          const props = Object.getOwnPropertyNames(template);
          for (const prop of props) {
            column[prop] = template[prop];
          }

          if (template.cellTemplate) {
            column.cellTemplate = template.cellTemplate;
          }

          // Function to get the value of the specified row
          column.getValue = function (row: any): any {
            if (!this.prop) {
              return null;
            }

            const split = this.prop.split('.');
            let res = row;

            for (let i = 0, j = split.length; i < j; i++) {
              res = res[split[i]];
              if (!res) {
                break;
              }
            }

            return res;
          };

          this.columns.push(column);
        }
      }
    }
  }

  get columnTemplates(): QueryList<TableColumnDirective> {
    return this._columnTemplates;
  }

  get paginationIndex(): number {
    return this._paginationIndex;
  }

  set paginationIndex(index: number) {
    this._paginationIndex = index;
  }

  get firstPage(): number {
    return 1;
  }

  get lastPage(): number {
    return Math.floor(this.rows.length / this.perPage) + (this.rows.length % this.perPage > 0 ? 1 : 0);
  }

  get currentPage(): number {
    return this._paginationIndex + 1;
  }

  set currentPage(page: number) {
    this._paginationIndex = page - 1;
  }

  get previousPage(): number|null {
    return this.currentPage === this.firstPage ? null : this.currentPage - 1;
  }

  get nextPage(): number|null {
    return this.currentPage === this.lastPage ? null : this.currentPage + 1;
  }

  get renderableRows(): any[] {
    const start = this.perPage * this.paginationIndex;
    const end = this.perPage * (this.paginationIndex + 1);
    return this.rows
      .slice(start, end)
      .map((row, index) => {
        row.__index__ = this.perPage * this.paginationIndex + index + 2;
        return row;
      });
  }

  sortByColumn(column: any): void {
    this.paginationIndex = 0; // We go to the first page of results

    if (column === this.sortColumn) {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      } else {
        this.sortOrder = 'asc';
      }
    } else {
      this.sortOrder = 'asc';
    }

    this.sortColumn = column;
  }

}
