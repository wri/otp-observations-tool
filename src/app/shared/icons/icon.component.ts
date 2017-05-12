import { Component, Input } from '@angular/core';

@Component({
  selector: 'otp-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() public name = '#icon-edit';

  get url () {
    // This is a fix for Firefox
    // Because the base HTML element has been added to index.html, FF can't
    // determine correctly where to find the symbols
    // By using the full URL, we can fix the issue
    return window.location.href
      .replace(window.location.hash, '') + this.name;
  }

}
