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
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  private isAdmin = false;
  isBackendAdmin = false;
  isLogged = false;
  acceptedLang = ['en', 'fr'];
  _lang = this.acceptedLang.includes(localStorage.getItem('lang'))
    ? localStorage.getItem('lang')
    : 'en';
  isStaging = false;

  managedObservers: Observer[] = [];
  _selectedObserverId: string = null;

  get lang() { return this._lang; }
  set lang(lang) { this.translateService.use(lang); }

  get selectedObserverId() { return this._selectedObserverId; }
  set selectedObserverId(val) {
    this._selectedObserverId = val;
    this.authService.userObserverId = val;
    location.reload();
  }

  get displayObserverSelector(): boolean {
    if (this.authService.isBackendAdmin()) return true;
    if (this.authService.managedObserverIds.length > 1) return true;

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
      this.observersService.getAll({ sort: 'name' })
        .then(data => {
          if (this.authService.isBackendAdmin() && this.authService.managedObserverIds.length === 0) {
            this.managedObservers = data;
          } else {
            this.managedObservers = data.filter(o => this.authService.managedObserverIds.includes(o.id));
          }

          if (!this.authService.userObserverId && this.managedObservers.length > 0) {
            this.selectedObserverId = this.managedObservers[0].id;
          }
        });
    });
    if (!environment.production) {
      this.isStaging = true;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
