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
    private http: Http
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

    // We only create NGO users
    payload.user.permissions_request = 'ngo';

    this.http.post(`${environment.apiUrl}/register`, payload)
      .map(response => response.json())
      .toPromise()
      .then(() => {
        alert('The request has been sent! We\'ll get back to you soon.');
        this.router.navigate(['']);
      })
      .catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
      })
      .then(() => this.loading = false);
  }

}
