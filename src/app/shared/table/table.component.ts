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
  @Input() name: string; // Unique name of the table
  @Input() caption: string;
  @Input() include: string[] = []; // Include param for the query
  @Input() defaultSort: string; // Default sort param (ex: "name" or "-name")
  @Input() options: any; // Additional options for the table
  @Input() defaultHiddenColumns: string[] = [];

  @Output() change = new EventEmitter<void>();

  previousState: JsonApiParams;
  loading = false;
  columns: any[] = [];
  sortColumn: any; // Column used for sorting the table
  sortOrder: 'asc' | 'desc'; // Sort order
  _perPage = 10;
  perPageOptions = [10, 20, 50, 100];

  private _columnTemplates: QueryList<TableColumnDirective>;
  private _paginationIndex = 0; // Zero-based number of the page

  get hiddenColumns(): string[] {
    try {
      const storedValue = JSON.parse(localStorage.getItem(`${this.name}-hidden-columns`));
      return Array.isArray(storedValue) ? storedValue : this.defaultHiddenColumns;
    } catch (e) {
      return this.defaultHiddenColumns;
    }
  }

  set hiddenColumns(hiddenColumns: string[]) {
    localStorage.setItem(`${this.name}-hidden-columns`, JSON.stringify(hiddenColumns));
  }

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

            const split = this.prop.replace(/[\[\]]/g, '').split('.');
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

        if (this.previousState) {
          this.restoreState();
        } else if (this.defaultSort) { // We eventually set the default sort
          const sortColumnProp = this.defaultSort.match(/-?(.*)/)[1];
          const sortColumn = this.columns.find(c => c.prop === sortColumnProp);
          const isDesc = !!this.defaultSort.match(/(-?).*/)[1].length;

          // We only set the sort if it hasn't set before or if
          // the columns has been reset and it stays the same
          if (!this.sortColumn || this.sortColumn.prop === sortColumn.prop) {
            this.sortColumn = sortColumn;
            this.sortOrder = isDesc ? 'desc' : 'asc';
          }
        }

        // If the columns are dynamically added or removed
        // the current sorting might not be available anymore
        // so we remove it
        if (this.sortColumn && !this.columns.find(c => c.prop === this.sortColumn.prop)) {
          this.sortColumn = null;
          this.change.emit();
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

  get previousPage(): number | null {
    return this.currentPage === this.firstPage ? null : this.currentPage - 1;
  }

  get nextPage(): number | null {
    return this.currentPage === this.lastPage ? null : this.currentPage + 1;
  }

  get perPage(): number {
    return this._perPage;
  }

  set perPage(page: number) {
    this._perPage = page;
    this.currentPage = 1;
    this.change.emit();
  }

  get state(): TableState {
    const include = [
      ...this.columns.filter(col => col.include)
        .map((col) => {
          // Two patterns can be used in the prop attribute:
          //   1. subcategory.name
          //   2. [subcategory.category].name
          const regexMatches = col.prop.match(/\[(.*)\](.*)/);

          // This is case 2.
          if (regexMatches && regexMatches.length > 1) {
            return regexMatches[1];
          }

          // This is case 1.
          return col.prop.split('.')[0];
        }),
      ...this.include
    ];

    let sortColumn;
    if (this.sortColumn) {
      sortColumn = this.sortColumn.prop.replace(/[\[\]]/g, '');
    }

    let sortOrder;
    if (this.sortOrder) {
      sortOrder = this.sortOrder === 'asc' ? 1 : -1;
    }

    return {
      page: this.currentPage,
      perPage: this.perPage,
      sortColumn,
      sortOrder,
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

  get visibleColumns(): any[] {
    return this.columns.filter(column => this.hiddenColumns.indexOf(column.name) === -1);
  }

  constructor(
    private translateService: TranslateService
  ) { }

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
   * Restore the state of the table
   */
  restoreState() {
    if (this.previousState.sort) {
      const sortColumnProp = this.previousState.sort.match(/-?(.*)/)[1];
      const sortColumn = this.columns.find(c => c.prop.replace(/[\[\]]/g, '') === sortColumnProp);
      const isDesc = !!this.previousState.sort.match(/(-?).*/)[1].length;

      if (sortColumn) {
        this.sortColumn = sortColumn;
        this.sortOrder = isDesc ? 'desc' : 'asc';
      }
    }

    this.perPage = this.previousState.page.size || this.perPage;

    this.change.emit();
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

  onToggleColumnVisibility(e: Event, columnName: string): void {
    const visible = (<HTMLInputElement>e.target).checked;

    if (visible) {
      this.hiddenColumns = [...this.hiddenColumns].filter(column => column !== columnName);
    } else {
      this.hiddenColumns = [...this.hiddenColumns, columnName];
    }
  }
}
