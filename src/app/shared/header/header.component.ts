import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { NavigationItem } from 'app/shared/navigation/navigation.component';

@Component({
  selector: 'otp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isLogged = false;
  private navigationItems: NavigationItem[] = [];

  constructor (private authService: AuthService) {
    this.authService.loginStatus.subscribe(isLogged => this.isLogged = isLogged);
  }

  async ngOnInit() {
    const isAdmin = await this.authService.isAdmin();

    this.navigationItems = [
      { name: 'Observations', url: 'observations' },
      { name: 'Observation fields', url: 'fields' },
      { name: 'Users', url: 'users' },
    ];

    if (!isAdmin) {
      // We just keep the "Observations" and "Observation fields" tabs
      this.navigationItems = this.navigationItems.slice(0, 2);
    }
  }

  logout(): void {
    this.authService.logout();
  }

}
