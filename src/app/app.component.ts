import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'otp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLogged = false;
  lang = 'en';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.authService.loginStatus.subscribe(isLogged => this.isLogged = isLogged);

    // We set the fallback language
    this.translateService.setDefaultLang('zu');

    // Everytime the user navigates to a page, we check which
    // language to use, and update the URL and localStorage
    // consequently
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        if (!this.route.snapshot.queryParams.lang) {
          // There's no lang param in the URL...
          const storageLang = localStorage.getItem('lang');

          // If it's been saved in the localStorage, the we
          // use it
          if (storageLang) {
            this.lang = storageLang;
          }

          // If not, we set English as the default language
          this.saveLocale();
        } else {
          // There's a lang param in the URL, then we change
          // the language
          this.lang = this.route.snapshot.queryParams.lang;
          this.saveLocale();
        }
      }
    });

    // Everytime the language is modified by the user, we update
    // the URL, localStorage and the translations
    this.translateService.onLangChange.subscribe(({ lang }) => {
      this.lang = lang;
      this.saveLocale();
    });
  }

  /**
   * Update the lang attribute of the html tag
   * for accessibility reasons (screen readers)
   */
  setHTMLLangAttribute(): void {
    document.documentElement.lang = this.lang;
  }

  /**
   * Update the lang attribute of the html tag, update
   * the lang query param, update the localStorage and
   * load the appropriate translations according to the
   * value of this.lang
   */
  saveLocale(): void {
    this.setHTMLLangAttribute();

    this.router.navigate([], {
      queryParams: { lang: this.lang },
      replaceUrl: true,
      relativeTo: this.route
    });

    localStorage.setItem('lang', this.lang);

    this.translateService.use(this.lang);
  }
}
