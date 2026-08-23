import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'otp-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TagComponent {

  @Input() type = 'info';

}
