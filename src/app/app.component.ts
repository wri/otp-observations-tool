import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'otp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLogged = false;

  constructor(private authService: AuthService) {
    this.authService.loginStatus.subscribe(isLogged => this.isLogged = isLogged);
  }
}
