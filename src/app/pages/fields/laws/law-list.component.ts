import { LawsService } from 'app/services/laws.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';

@Component({
  selector: 'otp-law-list',
  templateUrl: './law-list.component.html',
  styleUrls: ['./law-list.component.scss']
})
export class LawListComponent extends TableFilterBehavior {

  constructor(
    protected service: LawsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  /**
   * Shorten the passed string and add an ellipsis
   * if necessary
   * @param {string} string String to shorten
   * @param {number} [limit=80] Character limit
   * @returns {string}
   */
  shorten(string: string, limit = 80): string {
    if (!string) {
      return null;
    }

    if (string.length <= limit) {
      return string;
    }

    return string.slice(0, limit) + '...';
  }

  onInfo(row) {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([`edit/${row.id}`], { relativeTo: this.route });
  }

}
