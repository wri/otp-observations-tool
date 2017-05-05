import { Router } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-law-detail',
  templateUrl: './law-detail.component.html',
  styleUrls: ['./law-detail.component.scss']
})
export class LawDetailComponent implements OnInit {

  private countries: Country[];
  private titleText: String = 'New Law';

  constructor(
    private countriesService: CountriesService,
    private router: Router
  ) {
    this.countries = new Array<Country>();
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );
  }

  onCancel(): void{
    this.router.navigate(['/private/fields/laws']);
  }

  onSubmit(formValues):void {
    console.log('submit!', formValues);
  }


}
