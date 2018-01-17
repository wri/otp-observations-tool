import { JsonApiParams } from 'app/services/json-api.service';
import { TranslateService } from '@ngx-translate/core';
import { TABLET_BREAKPOINT } from 'app/directives/responsive.directive';
import { Component, Input, QueryList, ContentChildren, EventEmitter, Output, ViewChild, AfterContentInit } from '@angular/core';
import { TableColumnDirective } from 'app/shared/table/directives/column/column.directive';

export interface TableState {
  page: number;
  perPage: number;
  sortColumn: string;
  sortOrder: number;
  include: string[];
}

@Component({
  selector: 'otp-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements AfterContentInit {

  public rows: any[] = [];
  public rowCount: number; // Number of total rows (total results)
  @Input() caption: string;
  @Input() perPage = 10;
  @Input() include: string[] = []; // Include param for the query
  @Input() options: any; // Additional options for the table

  @Output() change = new EventEmitter<void>();

  loading = false;
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
    if (!this.rows.length) {
      return 1;
    }

    return Math.floor(this.rowCount / this.perPage) + (this.rowCount % this.perPage > 0 ? 1 : 0);
  }

  get currentPage(): number {
    return this._paginationIndex + 1;
  }

  set currentPage(page: number) {
    this._paginationIndex = page - 1;
    this.change.emit();

    if (window.innerWidth < TABLET_BREAKPOINT) {
      this.scrollToTop();
    }
  }

  get previousPage(): number|null {
    return this.currentPage === this.firstPage ? null : this.currentPage - 1;
  }

  get nextPage(): number|null {
    return this.currentPage === this.lastPage ? null : this.currentPage + 1;
  }

  get state(): TableState {
    const include = [
      ...this.columns.filter(col => col.include).map(col => col.prop.split('.')[0]),
      ...this.include
    ];

    return {
      page: this.currentPage,
      perPage: this.perPage,
      sortColumn: this.sortColumn && this.sortColumn.prop,
      sortOrder: this.sortOrder && this.sortOrder === 'asc' ? 1 : -1,
      include
    };
  }

  get renderableRows(): any[] {
    return this.rows
      .map((row, index) => {
        row.__index__ = this.perPage * this.paginationIndex + index + 2;
        return row;
      });
  }

  constructor(
    private translateService: TranslateService
  ) {}

  ngAfterContentInit(): void {
    // Angular doesn't detect the changes of the attributes of
    // the columns so we need to listen to the language changes
    // to force the columns to be re-rendered
    this.translateService.onLangChange.subscribe((lang) => {
      // Also, when the event is triggered, the language is not
      // already changed, so we need to sligthly delay the render
      setTimeout(() => this.columnTemplates = this.columnTemplates, 0);
    });
  }

  /**
   * Return the params for the API calls
   */
  getApiParams(): JsonApiParams {
    const params: JsonApiParams = {
      page: {
        size: this.state.perPage,
        number: this.state.page
      }
    };

    if (this.state.include.length) {
      params.include = this.state.include.join(',');
    }

    if (this.state.sortColumn) {
      params.sort = `${this.state.sortOrder < 0 ? '-' : ''}${this.state.sortColumn}`;
    }

    return params;
  }

  /**
   * Return whether the row is highlighted
   * @param {any} row Entry of data
   * @returns {boolean}
   */
  hasHighlight(row: any) {
    if (!this.options || !this.options.rows || this.options.rows.highlight === null
      || this.options.rows.highlight === undefined) {
      return false;
    }

    const condition = this.options.rows.highlight;
    if (typeof condition === 'function') {
      return condition(row);
    } else if (typeof condition === 'boolean') {
      return condition;
    } else {
      return !!row[condition];
    }
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

    // We emit a state change
    this.change.emit();
  }

  scrollToTop() {
    const scrollY = window.scrollY;
    const duration = 500;
    const frame = 16; // We assume a 60FPS animation
    let time = 0;
    const iterations = Math.ceil(duration / frame);

    const scrollToTop = () => {
      time += frame;

      if (duration - time > frame) {
        const posY = this.easeOut(time, scrollY, -scrollY, duration);
        window.scrollTo(0, posY);
        requestAnimationFrame(scrollToTop);
      } else {
        window.scrollTo(0, 0);
      }
    };

    requestAnimationFrame(scrollToTop);
  }

  easeOut(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) { return c / 2 * t * t + b; }
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

}
