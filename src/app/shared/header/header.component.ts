import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { NavigationItem } from 'app/shared/navigation/navigation.component';

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
  _lang = this.defaultLang;

  get lang() { return this._lang; }
  set lang(lang) {
    if (this._lang === lang) {
      return;
    }

    this._lang = lang;
    this.translateService.use(lang);

    this.router.navigate([], {
      queryParams: { lang },
      relativeTo: this.route
    });
  }

  constructor (
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    // We set the fallback language
    this.translateService.setDefaultLang('zu');

    // Language to use by default
    this.translateService.use(this.lang);

    this.route.queryParams.subscribe((params) => {
      if (params.lang && this.acceptedLang.indexOf(params.lang) !== -1) {
        this.lang = params.lang;
      } else {
        // This will update the URL with a correct lang param
        this.lang = this.lang;
      }
    });

    // Each time the status of the login change, we update some variables
    this.authService.loginStatus.subscribe(isLogged => {
      this.isLogged = isLogged;
      this.authService.isAdmin().then(isAdmin => this.isAdmin = isAdmin);
    });
  }

  logout(): void {
    this.authService.logout();
  }

}
