import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';


@Component({
  selector: 'otp-bottom-bar',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'role': 'menubar'
  },
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss']
})
export class BottombarComponent implements OnInit {

  isAdmin = false;
  @Input() public activeButton = 'observations';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    this.isAdmin = await this.auth.isAdmin();
  }

  onClick(buttonValue): void {
    this.activeButton = buttonValue;
    this.router.navigate([`private/${buttonValue}`]);
  }

}
