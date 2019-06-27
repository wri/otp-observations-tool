import { TranslateService } from '@ngx-translate/core';
import { ObserversService } from 'app/services/observers.service';
import { Observer } from 'app/models/observer.model';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'otp-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
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
    private http: Http,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.countriesService.getAll({ sort: 'name' })
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

    // We don't forget to remove the boolean value from
    // the payload
    delete payload.user.manager_role;

    // We also remove the attribute relative to consentment
    delete payload.user.has_rights;

    this.http.post(`${environment.apiUrl}/register`, payload)
      .map(response => response.json())
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
