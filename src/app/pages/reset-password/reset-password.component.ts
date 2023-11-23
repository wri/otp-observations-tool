import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
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
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService
  ) { }

  onSubmit(formValues) {
    this.loading = true;

    const payload = { password: formValues };

    this.http.post(`${environment.apiUrl}/reset-password`, payload)
      .toPromise()
      .then(async () => {
        alert(await this.translateService.get('register.success').toPromise());
        this.router.navigate(['']);
      })
      .catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
      })
      .then(() => this.loading = false);
  }

}
