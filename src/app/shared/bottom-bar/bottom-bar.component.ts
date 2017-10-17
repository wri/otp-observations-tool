import { Component, Input } from '@angular/core';
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
export class BottombarComponent {

  isAdmin = false;

  constructor(private authService: AuthService) {
    // Each time the status of the login change, we update some variables
    this.authService.loginStatus.subscribe(isLogged => {
      this.isAdmin = this.authService.isAdmin();
    });
  }

}
