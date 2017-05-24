import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { Country } from './../../../models/country.model';
import { CountriesService } from './../../../services/countries.service';
import { Router } from '@angular/router';
import { LawsService } from './../../../services/laws.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent extends TableFilterBehavior {

  constructor(
    protected service: CountriesService,
    private router: Router
  ) {
    super();
  }

  triggerNewCountry(): void {
    this.router.navigate(['private/fields/countries/new']);
  }

  onEdit(row): void {

  }

  private onDelete(country: Country): void {
    if (confirm(`Are you sure to delete the country: ${country.name}?`) ) {
      this.service.deleteCountry(country)
      .then((data) => {
        this.loadData();
        alert(data.json().messages[0].title);
      })
      .catch((e) => alert('Unable to delete the country: ${country.name} '));
    }
  }


}
