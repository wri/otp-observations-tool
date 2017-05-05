import { Router } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-species-detail',
  templateUrl: './species-detail.component.html',
  styleUrls: ['./species-detail.component.scss']
})
export class SpeciesDetailComponent implements OnInit {

  private countries: Country[];
  private countriesDropdownSettings: any;
  private countriesDropdownData: any;
  private titleText: String = 'New Species';

  constructor(
    private countriesService: CountriesService,
    private router: Router
  ) {
    this.countries = new Array<Country>();
    this.countriesDropdownSettings = {
      text: 'Please select a set of countries',
      enableSearchFilter: true
    };
    this.countriesDropdownData = [];
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
         this.countries.forEach((value) => {
          this.countriesDropdownData.push({ id: value.id, itenName: value.name });
         });
      }
    );
  }

  onCancel(): void{
    this.router.navigate(['/private/fields/species']);
  }

  onSubmit(formValues):void {
    console.log('submit!', formValues);
  }


}
