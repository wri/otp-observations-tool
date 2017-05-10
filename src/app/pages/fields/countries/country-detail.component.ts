import { Router } from '@angular/router';
import { CountriesService } from 'app/services/countries.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent {

  private titleText: String = 'New Country';
  private loading = false;

  constructor(
    private router: Router,
    private countriesService: CountriesService
  ) {
  }

  onCancel(): void {
    this.router.navigate(['/private/fields/countries']);
  }

  onSubmit(formValues): void {
    this.countriesService.createCountry(formValues).then(
        data => {
          alert('Country created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/countries']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }


}
