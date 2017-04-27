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
    private countriesService: CountriesService) {

      this.countries = new Array<Country>();
  }
  onSubmit() {
    console.log('onSubmit', this.model);
    this.loading = true;
  }

  ngOnInit(): void {
    this.countriesService.getCountries().then(
      data => {
         this.countries = data;
         console.log(this.countries);
      }
    );
  }


}
