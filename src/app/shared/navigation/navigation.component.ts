import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface NavigationItem {
  name: string;
  // If the URL isn't specified, then you have to listen to the change event
  url?: string;
}

@Component({
  selector: 'otp-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  @Input() private activeItem: NavigationItem;
  @Input() private items: NavigationItem[] = [];
  @Input() private layout: 'mini'|'horizontal'|'vertical' = 'horizontal';
  @Output() private change = new EventEmitter();

  // Whether or not the component should manage which item is active
  // If not, the router will automatically determine it
  private get manageActiveItem(): boolean {
    return this.items.reduce((res, item) => res || !item.url, false);
  }

  ngOnInit(): void {
    // We always set a default active item
    if (this.manageActiveItem && !this.activeItem && this.items.length) {
      this.activeItem = this.items[0];
    }
  }

  /**
   * Event handler executed when the user clicks an item
   * @private
   * @param {NavigationItem} item Clicked item
   */
  private onClick(item: NavigationItem): void {
    if (this.manageActiveItem) {
      this.activeItem = this.items.find(i => {
        return i === item;
      });
    }

    if (!item.url) {
      this.change.emit(item);
    }
  }

}
