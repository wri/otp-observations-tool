import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ObserversService } from 'app/services/observers.service';
import { Observer } from 'app/models/observer.model';
import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { UsersService } from 'app/services/users.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'otp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {

  private isAdmin = false;
  isBackendAdmin = false;
  isLogged = false;
  acceptedLang = ['en', 'fr', 'es'];
  _lang = this.acceptedLang.includes(localStorage.getItem('lang'))
    ? localStorage.getItem('lang')
    : 'en';
  isStaging = false;

  availableObservers: Observer[] = [];
  _selectedObserverId: string = null;

  get lang() { return this._lang; }
  set lang(lang) { this.translateService.use(lang); }

  get selectedObserverId() { return this._selectedObserverId; }
  // changing current observer context
  set selectedObserverId(val) {
    this._selectedObserverId = val;
    this.authService.userObserverId = val;
    if (location.href.includes('observations/new') ||
      location.href.includes('observations/edit')) {
      window.location.href = '/private/observations';
    } else {
      location.reload();
    }
  }

  get displayObserverSelector(): boolean {
    if (this.authService.isBackendAdmin()) return true;
    if (this.authService.availableObserverIds.length > 1) return true;

    return false;
  }

  constructor(
    private authService: AuthService,
    private observersService: ObserversService,
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.translateService.onLangChange.subscribe(({ lang }) => {
      this._lang = lang;
    });

    // Each time the status of the login change, we update some variables
    this.authService.loginStatus.subscribe(isLogged => {
      this.isLogged = isLogged;
      this.isAdmin = this.authService.isAdmin();
      this.isBackendAdmin = this.authService.isBackendAdmin();
      this._selectedObserverId = this.authService.userObserverId;
      this.loadAvailableObservers();
    });
    if (!environment.production) {
      this.isStaging = true;
    }
  }

  private loadAvailableObservers(): void {
    if (!this.isLogged || !this.displayObserverSelector) {
      this.availableObservers = [];
      return;
    }

    const params: any = {
      sort: 'name',
      // The selector only ever shows the name
      fields: { observers: 'name' }
    };

    // A backend admin can switch to any observer; everyone else is limited to their own,
    // which the API can filter far more cheaply than we can after the fact
    if (!this.isBackendAdmin) {
      params['filter[id]'] = this.authService.availableObserverIds.join(',');
    }

    this.observersService.getAll(params)
      .then(data => {
        this.availableObservers = data;

        if (!this.authService.userObserverId && data.length > 0) {
          this.selectedObserverId = data[0].id;
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
