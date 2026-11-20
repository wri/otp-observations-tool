import { ObserversService } from 'app/services/observers.service';
import { Observer } from 'app/models/observer.model';
import { environment } from 'environments/environment';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from 'app/shared/notifications/notification.service';


@Component({
  selector: 'otp-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RegisterComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl: string;
  countries: Country[] = [];
  observers: Observer[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private countriesService: CountriesService,
    private observersService: ObserversService,
    private http: HttpClient,
    private notifications: NotificationService
  ) { }

  ngOnInit(): void {
    // The form only lists the names and submits the ids
    this.countriesService.getAll({ sort: 'name', fields: { countries: 'name' } })
      .then(data => this.countries = data);

    this.observersService.getAll({ sort: 'name' })
      .then(data => this.observers = data);
  }

  onSubmit(formValues) {
    this.loading = true;

    const payload = { user: formValues };

    // We create an NGO or manager user depending on the
    // checkbox
    if (!formValues.manager_role) {
      payload.user.permissions_request = 'ngo';
    } else {
      payload.user.permissions_request = 'ngo_manager';
    }

    payload.user.organization_account = formValues.account_type === 'organization';
    delete payload.user.account_type;

    // We don't forget to remove the boolean value from
    // the payload
    delete payload.user.manager_role;

    // We also remove the attribute relative to consentment
    delete payload.user.has_rights;

    this.http.post(`${environment.apiUrl}/register`, payload)
      .toPromise()
      .then(async () => {
        this.notifications.success('register.success');
        this.router.navigate(['']);
      })
      .catch(error => {
        this.notifications.error(error?.error?.errors?.[0]?.title || 'errors.generic');
      })
      .then(() => this.loading = false);
  }

}
