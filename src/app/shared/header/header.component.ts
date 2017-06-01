import { Router, ActivatedRoute } from '@angular/router';
import { Component, Inject, LOCALE_ID } from '@angular/core';
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
  lang: string;

  constructor (
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) locale: string
  ) {
    this.lang = locale.slice(0, 2);

    // Each time the status of the login change, we update some variables
    this.authService.loginStatus.subscribe(isLogged => {
      this.isLogged = isLogged;
      this.authService.isAdmin().then(isAdmin => this.isAdmin = isAdmin);
    });
  }

  onChangeLanguage() {
    // We update the lang query param and reload the app so the other
    // bundle can be loaded
    this.router.navigate([], {
      queryParams: { lang: this.lang },
      relativeTo: this.route
    }).then(() => location.reload());
  }

  logout(): void {
    this.authService.logout();
  }

}
