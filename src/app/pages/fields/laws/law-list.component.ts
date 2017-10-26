import { Law } from 'app/models/law.model';
import { AuthService } from 'app/services/auth.service';
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

  tableOptions = {
    rows: {
      highlight: row => !row.complete
    }
  };

  isAdmin = this.authService.isAdmin();

  constructor(
    protected service: LawsService,
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

  onClickNewLaw() {
    this.router.navigate(['private', 'fields', 'laws', 'new']);
  }

  onEdit(row) {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([`edit/${row.id}`], { relativeTo: this.route });
  }

  /**
   * Return whether the logged user can edit the law
   * @param {Law} law
   * @returns {boolean}
   */
  canEdit(law: Law): boolean {
    if (!this.isAdmin) {
      return false;
    }

    return law.country.id === this.authService.userCountryId;
  }

}
