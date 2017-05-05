import { NavigationItem } from 'app/shared/navigation/navigation.component';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss']
})
export class SubcategoriesComponent implements OnInit {

  private navigationItems: NavigationItem[] = [
      { name: 'For Operators', url: 'operators' },
      { name: 'For Governance', url: 'governance' }
    ];

  constructor(
    private router: Router
  ) {

  }

  ngOnInit(): void {

  }

  onNavigationChange(event): void{

  }



}
