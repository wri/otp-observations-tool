import { Component, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'app/services/auth.service';


@Component({
  selector: 'otp-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class BottombarComponent {

  @HostBinding('attr.role') readonly role = 'menubar';

  isAdmin = false;

  constructor(private authService: AuthService) {
    // Each time the status of the login change, we update some variables
    this.authService.loginStatus.subscribe(isLogged => {
      this.isAdmin = this.authService.isAdmin();
    });
  }

}
