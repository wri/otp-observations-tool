import { TranslateService } from '@ngx-translate/core';
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
  returnUrl = '/private/observations';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParams.returnUrl) {
      this.returnUrl = this.route.snapshot.queryParams.returnUrl;
    }
  }

  login() {
    this.loading = true;
    this.authService.login(this.model.username, this.model.password)
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
