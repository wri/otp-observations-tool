import { AuthService } from 'app/services/auth.service';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { Government } from './../../../models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { ObserversService } from 'app/services/observers.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-government-list',
  templateUrl: './government-list.component.html',
  styleUrls: ['./government-list.component.scss']
})
export class GovernmentListComponent extends TableFilterBehavior {
  // TODO: same for producer, when we are sure all users can do that then delete this
  isAdmin = true; // this.authService.isAdmin();
  countryFilterParams: any = {};

  constructor(
    protected service: GovernmentsService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    public observersService: ObserversService,
  ) {
    super();

    this.countryFilterParams = {
      'filter[id]': (this.authService.observerCountriesIds || []).join(',')
    };
  }

  ngAfterViewInit(): void {
    this.filters.defaultApiParams = {
      'filter[country]': (this.authService.observerCountriesIds || []).join(',')
    };
    super.ngAfterViewInit();
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

  /**
   * Return whether the logged user can edit the government
   * @param {Government} government
   * @returns {boolean}
   */
  canEdit(government: Government): boolean {
    if (!this.isAdmin) {
      return false;
    }
    let countries = this.authService.observerCountriesIds;

    if (countries.length) {
      return countries.includes(parseInt(government.country.id));
    } else {
      return government.country.id === this.authService.userCountryId;
    }
  }

  onEdit(row): void {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate(['edit', row.id], { relativeTo: this.route });
  }
}
