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

  private _navigationItems: NavigationItem[] = [
    { name: 'Observations', url: '/private/observations' },
    { name: 'Observation fields', url: '/private/fields' },
    { name: 'Users', url: '/private/users' },
  ];

  get navigationItems(): NavigationItem[] {
    return this.isAdmin
      ? this._navigationItems
      : this._navigationItems.slice(0, 2);
  }

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
