import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import Hotjar from '@hotjar/browser';
import { Component, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { AuthService } from 'app/services/auth.service';
import { ConfirmDialogService } from 'app/shared/confirm-dialog/confirm-dialog.service';
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
    private translateService: TranslateService,
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef,
    private confirmDialog: ConfirmDialogService
  ) {
    this.authService.loginStatus.subscribe(isLogged => this.isLogged = isLogged);
    this.watchForUpdates();

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

  /**
   * The service worker serves the version it has; a new deployment only reaches the user
   * after it was downloaded and the page reloaded. Reloading is left to the user: they
   * might be in the middle of an observation (it is autosaved, but still).
   */
  private watchForUpdates(): void {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(filter((event) => event.type === 'VERSION_READY'))
      .subscribe(async () => {
        if (await this.confirmDialog.confirm('offline.newVersion')) {
          document.location.reload();
        }
      });

    // The worker only checks for a new version when it starts; an app that stays open for
    // days in the field would never see one
    const appIsStable = this.appRef.isStable.pipe(first((stable) => stable));
    concat(appIsStable, interval(60 * 60 * 1000)).subscribe(() => {
      this.swUpdate.checkForUpdate().catch((err) => console.error('Update check failed', err));
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
