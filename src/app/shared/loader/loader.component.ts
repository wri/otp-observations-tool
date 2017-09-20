import { Component, Input } from '@angular/core';

@Component({
  selector: 'otp-loader',
  styleUrls: ['loader.component.scss'],
  template: `
    <spinner *ngIf="overlay === false" [tickness]="4" [size]="35" color="#317a4b"></spinner>
    <div *ngIf="overlay !== false" [ngClass]="{ overlay: true, '-fixed': fixed !== false }">
      <spinner [tickness]="4" [size]="35" color="#317a4b"></spinner>
    </div>
  `
})
export class LoaderComponent {

  // Whether we want to display an overlay
  @Input() overlay = false;
  // Whether the overlay should have a fixed position
  @Input() fixed = false;

};
