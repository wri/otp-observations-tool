import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { NavigationItem } from 'app/shared/navigation/navigation.component';

@Component({
  selector: 'otp-desktop-header',
  templateUrl: './desktop-header.component.html',
  styleUrls: ['./desktop-header.component.scss']
})
export class DesktopHeaderComponent implements OnInit {

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
      // We just keep the "Observations" tab
      this.navigationItems = [this.navigationItems[0]];
    }
  }

}
