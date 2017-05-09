import { Router } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-operator-detail',
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.scss']
})
export class OperatorDetailComponent implements OnInit {

  private countries: Country[] = [];
  private titleText: String = 'New Operator';

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
    this.router.navigate(['/private/fields/operators']);
  }

  onSubmit(formValues):void {
    console.log('submit!', formValues);
  }


}
