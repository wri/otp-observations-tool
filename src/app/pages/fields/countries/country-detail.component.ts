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

  constructor(
    private router: Router
  ) {
  }

  onCancel(): void{
    this.router.navigate(['/private/fields/countries']);
  }

  onSubmit(formValues):void {
    console.log('submit!', formValues);
  }


}
