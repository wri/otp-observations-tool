import { NavigationItem } from 'app/shared/navigation/navigation.component';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss']
})
export class SubcategoriesComponent implements OnInit {

  private navigationItems: NavigationItem[] = [];

  constructor(
    private router: Router
  ) {

    this.navigationItems = [
      { name: 'FOR OPERATORS', url: 'operators' },
      { name: 'FOR GOVERNANCE', url: 'governance' }
    ];
  }

  ngOnInit(): void {

  }

  onNavigationChange(event): void{

  }



}
