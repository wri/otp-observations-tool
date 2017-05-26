import { Component } from '@angular/core';

@Component({
  selector: 'otp-loader',
  template: `
    <spinner [tickness]="4" [size]="35" color="#317a4b"></spinner>
  `
})
export class LoaderComponent {};
