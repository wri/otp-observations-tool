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
  countries: Country[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private countriesService: CountriesService,
    private http: Http) {

      this.countries = new Array<Country>();
  }
  onSubmit(formValues) {
    this.loading = true;

    const payload = { user: formValues };
    if (payload.user.permissions_request === 'default') {
      delete payload.user.permissions_request;
    }

    // We only create NGO users
    payload.user.permissions_request = 'ngo';

    this.http.post(`${environment.apiUrl}/register`, payload)
      .map(response => response.json())
      .toPromise().then(
        data => {
          alert('User registered successfully!');
          this.loading = false;
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );
  }


}
