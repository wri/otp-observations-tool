import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import Hotjar from '@hotjar/browser';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { environment } from 'environments/environment';

// declare gives Angular app access to ga function
declare let ga: (...args: unknown[]) => void;

const ACCEPTED_LOCALES = ['en', 'fr', 'es'];

@Component({
  selector: 'otp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
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

    if (ga) {
      ga('create', `${environment.GOOGLE_ANALYTICS_ID}`, 'auto');
    }

    if (environment.HOTJAR_ID && environment.HOTJAR_VERSION) {
      Hotjar.init(Number(environment.HOTJAR_ID), Number(environment.HOTJAR_VERSION));
    }

    // We set the default language
    const storedLang = localStorage.getItem('lang');
    if (storedLang && ACCEPTED_LOCALES.includes(storedLang)) {
      this.lang = storedLang;
      this.translateService.setDefaultLang(storedLang);
      this.setHTMLLangAttribute();
    } else {
      this.lang = 'en';
      localStorage.setItem('lang', 'en');
      this.translateService.setDefaultLang('en');
      this.setHTMLLangAttribute();
    }

    // Everytime the language is modified by the user, we update
    // the URL, localStorage and the translations
    this.translateService.onLangChange.subscribe(({ lang }) => {
      // NOTE: make sure the lang is different because
      // otherwise we'll enter an infinite loop reloading
      // the page
      if (lang !== this.lang) {
        this.lang = lang;
        this.setHTMLLangAttribute();
        localStorage.setItem('lang', this.lang);
      }
    });
  }

  private sendPageView(e: NavigationEnd): void {
    const fullURL: string = new URL(e.urlAfterRedirects, location.origin).href;
    if (environment.production) {
      if (ga) {
        ga('set', 'page', fullURL);
        ga('send', 'pageview');
      }
    } else {
      // Deliberate: this branch only runs when not in production, so it never reaches users.
      console.info(`[GA] Page view: ${fullURL}`);
    }
  }


  /**
   * Update the lang attribute of the html tag
   * for accessibility reasons (screen readers)
   */
  setHTMLLangAttribute(): void {
    document.documentElement.lang = this.lang;
  }
}
