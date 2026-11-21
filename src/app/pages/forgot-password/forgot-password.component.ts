import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from 'app/shared/notifications/notification.service';


@Component({
  selector: 'otp-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ForgotPasswordComponent {

  loading = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private notifications: NotificationService
  ) { }

  onSubmit(formValues) {
    this.loading = true;

    const payload = { password: formValues };

    this.http.post(`${environment.apiUrl}/reset-password`, payload)
      .toPromise()
      .then(async () => {
        this.notifications.success('forgotPassword.success', { email: payload.password.email });
        this.router.navigate(['']);
      })
      .catch(error => {
        this.notifications.error(error?.error?.errors?.[0]?.title || 'errors.generic');
      })
      .then(() => this.loading = false);
  }

}
