import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { NavigationItem } from 'app/shared/navigation/navigation.component';
import { environment } from 'environments/environment';

@Component({
  selector: 'otp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  private isAdmin = false;
  isLogged = false;
  acceptedLang = ['en', 'fr'];
  defaultLang = 'en';
  _lang = 'en';
  isStaging = false;

  get lang() { return this._lang; }
  set lang(lang) { this.translateService.use(lang); }

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.translateService.onLangChange.subscribe(({ lang }) => this._lang = lang);

    // Each time the status of the login change, we update some variables
    this.authService.loginStatus.subscribe(isLogged => {
      this.isLogged = isLogged;
      this.isAdmin = this.authService.isAdmin();
    });

    if (!environment.production) {
      this.isStaging = true;
    }
  }

  logout(): void {
    this.authService.logout();
  }

}
