import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl = '/private/observations';
  accountUnlocked = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const { returnUrl, message } = this.route.snapshot.queryParams;

    if (returnUrl) {
      this.returnUrl = returnUrl;
    }

    // the API redirects here after an account is unlocked from the email link
    if (message === 'user_unlocked') {
      this.accountUnlocked = true;

      // drop the param, so the notice doesn't come back on reload
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { message: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  login() {
    this.loading = true;
    this.authService.login(this.model.username, this.model.password, !!this.model.rememberMe)
      .then(async isLogged => {
        if (!isLogged) {
          alert(await this.translateService.get('login.permissionError').toPromise());
        } else {
          this.router.navigate([this.returnUrl]);
        }

        return isLogged;
      })
      .catch(async (error) => {
        alert(await this.translateService.get('login.error').toPromise());
      })
      .then(() => this.loading = false);
  }

  triggerRegister() {
    this.router.navigate(['/register']);
  }
}
