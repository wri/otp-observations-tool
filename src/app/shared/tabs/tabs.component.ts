// import { Component, Input, HostListener, Output, EventEmitter } from '@angular/core';

// export interface Tab {
//   id: string;
//   name: string;
// }

// @Component({
//   selector: 'otp-tabs',
//   templateUrl: './tabs.component.html',
//   styleUrls: ['./tabs.component.scss']
// })
// export class TabsComponent {

//   @Input() tabs: Tab[] = [];
//   @Input() currentTab = 0; // Index of the current Tab
//   @Output() change: EventEmitter<Tab> = new EventEmitter();

//   get tab () {
//     return this.tabs[this.currentTab];
//   }

//   set tab (tab: Tab) {
//     this.currentTab = this.tabs.findIndex(function (t) {
//       return t === tab;
//     });

//     this.change.emit(this.tab);
//   }

//   /**
//    * Event handler executed when the user clicks a tab
//    * @param {TabItem} tab clicked tab
//    */
//   onClickTab (tab: Tab): void {
//     this.tab = tab;
//   }

//   /**
//    * Event handler executed when the user presses a key while the focus
//    * is on the component
//    * @param {KeyboardEvent} e event
//    */
//   @HostListener('keydown',['$event'])
//   onKeydown (e: KeyboardEvent) {
//     switch (e.keyCode) {
//       case 37: // left arrow
//       case 38: // top arrow
//         let previousTabIndex = (this.currentTab - 1) % this.tabs.length;
//         if (previousTabIndex < 0) {
//           previousTabIndex = this.tabs.length - 1;
//         }
//         this.tab = this.getTab(previousTabIndex);
//         break;

//       case 39: // right arrow
//       case 40: // down arrow
//         const nextTabIndex = (this.currentTab + 1) % this.tabs.length;
//         this.tab = this.getTab(nextTabIndex);
//         break;

//       default:
//     }
//   }

//   /**
//    * Return the tab associated to the index
//    * @private
//    * @param {number} tabIndex index of the tab
//    * @returns {Tab} tab
//    */
//   private getTab (tabIndex: number): Tab {
//     return this.tabs[tabIndex];
//   }

// }
