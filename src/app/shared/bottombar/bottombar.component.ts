import { Router } from '@angular/router';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'otp-bottombar',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'role': 'menubar'
  },
  templateUrl: './bottombar.component.html',
  styleUrls: ['./bottombar.component.scss']
})
export class BottombarComponent {

  admin = true;
  @Input() public activeButton = 'observations';

  constructor(private router: Router) {}

  onClick(buttonValue): void {
    this.activeButton = buttonValue;
    this.router.navigate([buttonValue]);
  }

}
