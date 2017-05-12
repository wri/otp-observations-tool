import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {}

  ngOnInit(): void {
    // reset login status
    this.authService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/private/observations';
  }

  login() {
    this.loading = true;
    this.authService.login(this.model.username, this.model.password)
      .then(isLogged => {
        if (!isLogged) {
          alert('You are not allowed to access this app');
        } else {
          this.router.navigate([this.returnUrl]);
        }
      })
      .catch((error) => {
        alert('You entered a wrong username+password combination');
      })
      .then(() => this.loading = false);
  }

  triggerRegister() {
    this.router.navigate(['/register']);
  }
}
