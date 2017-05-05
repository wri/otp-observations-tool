import { Router } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-government-detail',
  templateUrl: './government-detail.component.html',
  styleUrls: ['./government-detail.component.scss']
})
export class GovernmentDetailComponent implements OnInit {

  private countries: Country[] = [];
  private titleText: String = 'New Government';

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
    this.router.navigate(['/private/fields/governments']);
  }

  onSubmit(formValues):void {
    console.log('submit!', formValues);
  }


}
