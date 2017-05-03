import { Component } from '@angular/core';
import { NavigationItem } from 'app/shared/navigation/navigation.component';

@Component({
  selector: 'otp-desktop-header',
  templateUrl: './desktop-header.component.html',
  styleUrls: ['./desktop-header.component.scss']
})
export class DesktopHeaderComponent {

  private navigationItems: NavigationItem[] = [
    { name: 'Observations', url: 'observations' },
    { name: 'Observation fields', url: 'fields' },
    { name: 'Users', url: 'users' },
  ];

}
