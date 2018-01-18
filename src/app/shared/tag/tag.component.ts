import { Component, Input } from '@angular/core';

@Component({
  selector: 'otp-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent {

  @Input() type = 'info';

}
