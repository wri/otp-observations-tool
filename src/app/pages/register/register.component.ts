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
  countries: Array<String>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private countriesService: CountriesService) {

      this.countries = new Array<String>();
  }
  register() {
    this.loading = true;
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         console.log('data', data);
      }
    );
  }


}
