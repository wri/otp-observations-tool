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
  // shown above the form: either a key to translate, or text the API already worded
  notice: { type: 'success' | 'error', key?: string, text?: string } = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const { returnUrl, message } = this.route.snapshot.queryParams;

    if (returnUrl) {
      this.returnUrl = returnUrl;
    }

    // the API redirects here after an account is unlocked from the email link
    if (message === 'user_unlocked') {
      this.notice = { type: 'success', key: 'login.unlocked' };

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
    this.notice = null;

    this.authService.login(this.model.username, this.model.password, !!this.model.rememberMe)
      .then(isLogged => {
        if (!isLogged) {
          this.notice = { type: 'error', key: 'login.permissionError' };
        } else {
          this.router.navigate([this.returnUrl]);
        }
      })
      .catch((error) => {
        // the API words these, it is the only one that can tell a locked
        // account from a wrong password
        this.notice = { type: 'error', text: error?.error?.errors?.[0]?.title };
      })
      .then(() => this.loading = false);
  }

  triggerRegister() {
    this.router.navigate(['/register']);
  }
}
