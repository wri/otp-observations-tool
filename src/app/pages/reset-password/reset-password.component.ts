import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'otp-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {

  loading = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService
  ) { }

  onSubmit(formValues) {
    this.loading = true;

    this.http.post(`${environment.apiUrl}/users/password`, {
      password: {
        password: formValues.new_password,
        password_confirmation: formValues.password_confirmation,
        reset_password_token: this.route.snapshot.queryParams.reset_password_token
      }
    })
      .toPromise()
      .then(async (response: any) => {
        alert(await this.translateService.get('resetPassword.success').toPromise());
        const email = response.data.attributes.email;
        return this.authService.login(email, formValues.new_password).then(() => {
          this.router.navigate(['']);
        });
      })
      .catch(e => {
        if (e.error && e.error.errors && e.error.errors.length > 0) {
          alert(e.error.errors.map(error => error.title).join('\n'));
        } else {
          alert('An error occurred');
        }
      })
      .then(() => this.loading = false);
  }

}
