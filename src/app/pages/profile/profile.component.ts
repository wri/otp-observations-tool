import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(private auth: AuthService) {

  }

  public triggerLogout(): void{
    this.auth.logout();
  }


}
