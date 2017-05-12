import { LawsService } from 'app/services/laws.service';
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

  countries: Country[];
  titleText: String = 'New Law';
  loading = false;

  constructor(
    private countriesService: CountriesService,
    private lawsService: LawsService,
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

    this.loading = true;
    this.lawsService.createLaw(formValues).then(
        data => {
          alert('Law created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/laws']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }


}
