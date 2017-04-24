import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email: string;
  password: string;
  submitted = false;
  unauthorized = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm): void {
    this.submitted = true;

    if (form.valid) {
      this.authService.login(this.email, this.password)
        .then(() => this.router.navigate(['observation']))
        .catch(() => this.unauthorized = true);
    }
  }
}
