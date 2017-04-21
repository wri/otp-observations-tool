import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  buttonText: string = 'Login';

  constructor(private auth: AuthService) {

  }

  public onLogin(): void {
    this.auth.login('user', 'password').then( () => this.buttonText = 'Logged');
  }


}
