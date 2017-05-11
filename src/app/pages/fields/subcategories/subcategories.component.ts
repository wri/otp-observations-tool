import { NavigationItem } from 'app/shared/navigation/navigation.component';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss']
})
export class SubcategoriesComponent {

  navigationItems: NavigationItem[] = [
      { name: 'Operators', url: 'operators' },
      { name: 'Governance', url: 'governance' }
    ];

  constructor(
    private router: Router
  ) {

  }

}
