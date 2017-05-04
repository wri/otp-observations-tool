import { Component } from '@angular/core';
import { NavigationItem } from 'app/shared/navigation/navigation.component';

@Component({
  selector: 'otp-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.scss']
})
export class FieldListComponent {

  private navigationItems: NavigationItem[] = [
    { name: 'Categories', url: 'categories' },
    { name: 'Sub-categories', url: 'subcategories' },
    { name: 'Species', url: 'species' },
    { name: 'Countries', url: 'countries' },
    { name: 'Governments', url: 'governments' },
    { name: 'Operators', url: 'operators' },
    { name: 'Monitors', url: 'observers' },
    { name: 'Laws', url: 'laws' },
  ];

}
