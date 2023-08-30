import { NavigationItem } from 'app/shared/navigation/navigation.component';
import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'otp-my-otp',
  templateUrl: './my-otp.component.html',
  styleUrls: ['./my-otp.component.scss']
})
export class MyOTPComponent {
  constructor(
    private authService: AuthService,
  ) {}

  get isBackendAdmin() {
    return this.authService.isBackendAdmin();
  }
}
