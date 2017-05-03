import { Router } from '@angular/router';
import { NavigationItem } from './../navigation/navigation.component';
import { Component } from '@angular/core';


@Component({
  selector: 'otp-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent {

  private navigationItems: NavigationItem[] = [
    { name: 'Observations', url: 'observations' },
    { name: 'Observation fields', url: 'fields' },
    { name: 'Users', url: 'users' },
  ];

}
