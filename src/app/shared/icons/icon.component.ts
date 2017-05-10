import { Component, Input } from '@angular/core';

@Component({
  selector: 'otp-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {

  @Input() public name = '#icon-edit';
}
