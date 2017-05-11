import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { NavigationItem } from 'app/shared/navigation/navigation.component';

@Component({
  selector: 'otp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  private navigationItems: NavigationItem[] = [];

  constructor (private auth: AuthService) {}

  async ngOnInit() {
    const isAdmin = await this.auth.isAdmin();

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

  logout(): void{
    this.auth.logout();
  }

}
