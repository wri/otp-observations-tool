import { AuthService } from 'app/services/auth.service';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { Government } from './../../../models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-government-list',
  templateUrl: './government-list.component.html',
  styleUrls: ['./government-list.component.scss']
})
export class GovernmentListComponent extends TableFilterBehavior {

  constructor(
    protected service: GovernmentsService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService
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

  onEdit(row): void {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate(['edit', row.id], { relativeTo: this.route });
  }


}
