import { Component, LOCALE_ID, Inject } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'otp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLogged = false;

  constructor(private authService: AuthService, @Inject(LOCALE_ID) private locale: string) {
    this.authService.loginStatus.subscribe(isLogged => this.isLogged = isLogged);
    this.setHTMLLangAttribute();
  }

  setHTMLLangAttribute(): void {
    document.documentElement.lang = this.locale.slice(0, 2);
  }
}
