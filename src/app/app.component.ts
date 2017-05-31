import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Component, LOCALE_ID, Inject } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'otp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLogged = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.authService.loginStatus.subscribe(isLogged => this.isLogged = isLogged);
    this.setHTMLLangAttribute();

    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd && !this.route.snapshot.queryParams['lang']) {
        this.addLocaleToURL();
      }
    });
  }

  setHTMLLangAttribute(): void {
    document.documentElement.lang = this.locale.slice(0, 2);
  }

  addLocaleToURL(): void {
    this.router.navigate([], {
      queryParams: { lang: this.locale.slice(0, 2) },
      replaceUrl: true,
      relativeTo: this.route
    });
  }
}
