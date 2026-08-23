import { JsonApiParams } from 'app/services/json-api.service';
import { TranslateService } from '@ngx-translate/core';
import { TABLET_BREAKPOINT } from 'app/directives/responsive.directive';
import { Component, Input, QueryList, ContentChildren, EventEmitter, Output, ViewChild, ElementRef, AfterContentInit, AfterViewChecked, ChangeDetectionStrategy } from '@angular/core';
import { TableColumnDirective } from 'app/shared/table/directives/column/column.directive';
import uniq from 'lodash/uniq';

export interface TableState {
  page: number;
  perPage: number;
  sortColumn: string;
  sortOrder: number;
  include: string[];
  fields: Record<string, string[]>;
}

@Component({
  selector: 'otp-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TableComponent implements AfterContentInit, AfterViewChecked {

  public rows: any[] = [];
  public rowCount: number; // Number of total rows (total results)
  @Input() name: string; // Unique name of the table
  @Input() caption: string;
  @Input() include: string[] = []; // Include param for the query
  @Input() type: string; // JSON:API type of the primary resource, set by TableFilterBehavior
  // Sparse fieldsets for the query, keyed by JSON:API resource type. Merged with the
  // fieldsets the columns declare. Types left out of the map keep all of their fields.
  @Input() fields: Record<string, string | string[]> = {};
  @Input() defaultSort: string; // Default sort param (ex: "name" or "-name")
  @Input() options: any; // Additional options for the table
  @Input() defaultHiddenColumns: string[] = [];
  @Input() adjustToScreenHeight = false;
  @Input() hideVisibleColumnsBox = false;

  @Output() changed = new EventEmitter<void>();

  @ViewChild('tableContainer', { static: true }) tableContainer: ElementRef;

  previousState: JsonApiParams;
  loading = false;
  columns: any[] = [];
  sortColumn: any; // Column used for sorting the table
  sortOrder: 'asc' | 'desc'; // Sort order
  _perPage = 10;
  perPageOptions = [10, 20, 50, 100];

  private _columnTemplates: QueryList<TableColumnDirective>;
  private _paginationIndex = 0; // Zero-based number of the page

  /**
   * Whether the table overflows horizontally.
   *
   * Deliberately a cached field rather than a getter. Consumers read this from a parent
   * template (observation-list) that is checked *before* this component has rendered its
   * rows, so a live DOM measurement answered false on the first pass and true on the
   * second — which is ExpressionChangedAfterItHasBeenCheckedError. Reading scrollWidth
   * from a template binding also forced a synchronous layout on every change detection
   * cycle; now it happens once per cycle, in ngAfterViewChecked.
   */
  isHorizontalScrollVisible = false;

  get hiddenColumns(): string[] {
    const alwaysVisibleColumns = this.columns.filter(c => !c.hideable).map(c => c.name);
    const alwaysHiddenColumns = this.columns.filter(c => c.hidden).map(c => c.name);

    try {
      const storedValue = JSON.parse(localStorage.getItem(`${this.name}-hidden-columns`));
      const columns = Array.isArray(storedValue) ? storedValue : this.defaultHiddenColumns;

      return uniq([...columns.filter((name) => !alwaysVisibleColumns.includes(name)), ...alwaysHiddenColumns]);
    } catch (e) {
      return uniq([...this.defaultHiddenColumns, ...alwaysHiddenColumns]);
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
          const column = {} as any;

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

            // eslint-disable-next-line no-useless-escape -- escapes kept for readability of this regex
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
          if ((!this.sortColumn || this.sortColumn.prop === sortColumn.prop) && sortColumn.sortable !== false) {
            this.sortColumn = sortColumn;
            this.sortOrder = isDesc ? 'desc' : 'asc';
          }
        }

        // If the columns are dynamically added or removed
        // the current sorting might not be available anymore
        // so we remove it
        // console.log(sortColumn);
        if (this.sortColumn && this.sortColumn.sortable === false) {
          this.sortColumn = null;
          this.changed.emit();
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
    this.changed.emit();

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
    this.changed.emit();
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
      // eslint-disable-next-line no-useless-escape -- escapes kept for readability of this regex
      sortColumn = this.sortColumn.prop.replace(/[\[\]]/g, '');
    }

    let sortOrder;
    if (this.sortOrder) {
      sortOrder = this.sortOrder === 'asc' ? 1 : -1;
    }

    const fields = this.columns.reduce(
      (res, col) => this.mergeFields(res, col.fields),
      this.mergeFields({}, this.fields)
    );

    // In JSON:API relationships are fields too, so restricting the fields of the primary
    // resource also drops the linkage of the relationships we include, leaving the
    // included resources unreachable. We add them back here rather than asking every
    // caller to keep its fieldset in sync with its includes.
    if (this.type && fields[this.type]) {
      fields[this.type] = uniq([...fields[this.type], ...include.map(rel => rel.split('.')[0])]);
    }

    return {
      page: this.currentPage,
      perPage: this.perPage,
      sortColumn,
      sortOrder,
      include,
      fields
    };
  }

  get renderableRows(): any[] {
    return this.rows
      .map((row, index) => {
        row.__index__ = this.perPage * this.paginationIndex + index + 2;
        return row;
      });
  }

  get hideableColumns(): any[] {
    return this.columns.filter(column => column.hideable);
  }

  get visibleColumns(): any[] {
    return this.columns.filter(column => this.hiddenColumns.indexOf(column.name) === -1);
  }

  constructor(
    private translateService: TranslateService
  ) { }

  ngAfterViewChecked(): void {
    const el = this.tableContainer.nativeElement;
    const visible = el.scrollWidth > el.clientWidth;

    if (visible !== this.isHorizontalScrollVisible) {
      // Assign in a fresh change detection pass rather than mutating state the current
      // one has already checked. The guard above stops this from looping: once the value
      // has settled, the next pass finds them equal and schedules nothing.
      Promise.resolve().then(() => this.isHorizontalScrollVisible = visible);
    }
  }

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

    const fields = this.state.fields;
    const fieldTypes = Object.keys(fields);
    if (fieldTypes.length) {
      params.fields = fieldTypes.reduce((res, type) => {
        res[type] = fields[type].join(',');
        return res;
      }, {});
    }

    return params;
  }

  /**
   * Merge a fieldset map into another one, taking the union of the fields of each type.
   * Accepts both the array and the comma-separated string form.
   */
  private mergeFields(
    target: Record<string, string[]>,
    source: Record<string, string | string[]>
  ): Record<string, string[]> {
    return Object.keys(source || {}).reduce((res, type) => {
      const value = source[type];
      const list = (Array.isArray(value) ? value : `${value}`.split(','))
        .map(field => field.trim())
        .filter(field => !!field);

      res[type] = uniq([...(res[type] || []), ...list]);

      return res;
    }, { ...target });
  }

  /**
   * Restore the state of the table
   */
  restoreState() {
    if (this.previousState.sort) {
      const sortColumnProp = this.previousState.sort.match(/-?(.*)/)[1];
      // eslint-disable-next-line no-useless-escape -- escapes kept for readability of this regex
      const sortColumn = this.columns.find(c => c.prop.replace(/[\[\]]/g, '') === sortColumnProp);
      const isDesc = !!this.previousState.sort.match(/(-?).*/)[1].length;

      if (sortColumn && sortColumn.sortable !== false) {
        this.sortColumn = sortColumn;
        this.sortOrder = isDesc ? 'desc' : 'asc';
      }
    }

    this.perPage = this.previousState.page.size || this.perPage;

    this.changed.emit();
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
    this.changed.emit();
  }

  scrollToTop() {
    const scrollY = window.scrollY;
    const duration = 500;
    const frame = 16; // We assume a 60FPS animation
    let time = 0;

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
    const visible = (e.target as HTMLInputElement).checked;

    if (visible) {
      this.hiddenColumns = [...this.hiddenColumns].filter(column => column !== columnName);
    } else {
      this.hiddenColumns = [...this.hiddenColumns, columnName];
    }
  }
}
