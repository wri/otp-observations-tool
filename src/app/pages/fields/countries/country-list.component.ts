import { Country } from './../../../models/country.model';
import { CountriesService } from './../../../services/countries.service';
import { Router } from '@angular/router';
import { LawsService } from './../../../services/laws.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit {

  countries: Country[];

  constructor(
    private countriesService: CountriesService,
    private router: Router
  ) {
    this.countries = [];
  }

  ngOnInit(): void {
    this.countriesService.getAll().then((data) => {
      this.countries = data;
    });
  }

  triggerNewCountry(): void{
    this.router.navigate(['private/fields/countries/new']);
  }

  onEdit(row): void{

  }

  private onDelete(country: Country): void {
    if (confirm(`Are you sure to delete the country: ${country.name}?`) ) {
      this.countriesService.deleteCountry(country)
      .then((data) => {
        this.ngOnInit();
        alert(data.json().messages[0].title);
      })
      .catch((e) => alert('Unable to delete the country: ${country.name} '));
    }
  }


}
