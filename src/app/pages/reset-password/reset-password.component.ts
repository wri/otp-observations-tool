import { environment } from 'environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from 'app/shared/notifications/notification.service';


@Component({
  selector: 'otp-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ResetPasswordComponent {

  loading = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private notifications: NotificationService
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
        this.notifications.success('resetPassword.success');
        const email = response.data.attributes.email;
        return this.authService.login(email, formValues.new_password).then(() => {
          this.router.navigate(['']);
        });
      })
      .catch(e => {
        if (e.error && e.error.errors && e.error.errors.length > 0) {
          this.notifications.error(e.error.errors.map(error => error.title).join('\n'));
        } else {
          this.notifications.error('errors.generic');
        }
      })
      .then(() => this.loading = false);
  }

}
