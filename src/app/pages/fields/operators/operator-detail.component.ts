import { OperatorsService } from 'app/services/operators.service';
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

  countries: Country[] = [];
  titleText: String = 'New Operator';
  loading: boolean;

  constructor(
    private countriesService: CountriesService,
    private operatorsService: OperatorsService,
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
    this.loading = true;
    this.operatorsService.createOperator(formValues).then(
        data => {
          alert('Operator created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/operators']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }


}
