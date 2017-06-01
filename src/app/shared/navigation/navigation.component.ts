import { NavigationItemDirective } from './directives/item/item.directive';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';

export interface NavigationItem {
  name: string;
  // If the URL isn't specified, then you have to listen to the change event
  url?: string;
  // If the route should be exactly matched
  exact?: boolean;
}

@Component({
  selector: 'otp-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements AfterContentInit {

  @Input() private activeItem: NavigationItem;
  @Input() layout: 'mini'|'horizontal'|'vertical' = 'horizontal';
  @Output() private change = new EventEmitter();

  @ContentChildren(NavigationItemDirective)
  items: QueryList<NavigationItemDirective>;

  // Whether or not the component should manage which item is active
  // If not, the router will automatically determine it
  private get manageActiveItem(): boolean {
    return this.items.toArray().reduce((res, item) => res || !item.url, false);
  }

  constructor (
    private router: Router,
    private activedRoute: ActivatedRoute
  ) {}

  ngAfterContentInit(): void {
    // We always set a default active item
    if (this.manageActiveItem && !this.activeItem && this.items.toArray().length) {
      this.activeItem = this.items.first;
    }
  }

  /**
   * Event handler executed when the user clicks an item
   * @private
   * @param {NavigationItem} item Clicked item
   */
  private onClick(item: NavigationItem): void {
    if (this.manageActiveItem) {
      this.activeItem = this.items.toArray().find(i => {
        return i === item;
      });
    }

    if (!item.url) {
      this.change.emit(item);
    }
  }

  /**
   * Return whether the item is active
   * @param item
   */
  private isActive(item: NavigationItem): boolean {
    const urlTree = this.router.createUrlTree([item.url], { relativeTo: this.activedRoute });

    return this.manageActiveItem
      ? item === this.activeItem
      : this.router.isActive(urlTree, item.exact || false);
  }

}
