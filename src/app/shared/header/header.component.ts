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

  constructor (private authService: AuthService) {
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
