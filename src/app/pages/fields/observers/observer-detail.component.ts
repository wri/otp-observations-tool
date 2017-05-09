import { Router } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-observer-detail',
  templateUrl: './observer-detail.component.html',
  styleUrls: ['./observer-detail.component.scss']
})
export class ObserverDetailComponent implements OnInit {

  private countries: Country[] = [];
  private titleText: String = 'New Monitor';

  constructor(
    private countriesService: CountriesService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );
  }

  onCancel(): void{
    this.router.navigate(['/private/fields/observers']);
  }

  onSubmit(formValues):void {
    console.log('submit!', formValues);
  }


}
