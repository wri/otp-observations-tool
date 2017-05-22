import { Operator } from 'app/models/operator.model';
import { OperatorsService } from 'app/services/operators.service';
import { Router, ActivatedRoute } from '@angular/router';
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
  titleText: string;
  loading: boolean;
  submitButtonText: string;
  public mode = 'new';
  operatorId: string;
  operator: Operator;

  constructor(
    private countriesService: CountriesService,
    private operatorsService: OperatorsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.router.url.match(/\/edit\/[0-9]+$/)) {
      this.setMode('edit');
    } else {
      this.setMode('new');
    }
  }

  setMode(value: string): void {
    this.mode = value;
    if (this.mode === 'edit') {
      this.titleText = 'Edit AnnexOperator';
      this.submitButtonText = 'Update';
      this.operatorId = this.route.snapshot.params['id'];
    } else if (this.mode === 'new') {
      this.titleText = 'New AnnexOperator';
      this.submitButtonText = 'Create';
    }
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );

    if (this.mode === 'edit') {
      this.loadOperator();
    }
  }

  loadOperator(): void {
    this.loading = true;
    this.operatorsService.getById(this.operatorId).then(
      data => {
        this.operator = data;
        this.loading = false;
      }
    ).catch( error => alert(error));
  }

  onCancel(): void{
    this.router.navigate(['/private/fields/operators']);
  }

  onSubmit(formValues):void {
    this.loading = true;
    if (this.mode === 'new') {
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
    } else {
      this.operatorsService.updateOperator(this.operator).then(
        data => {
          alert('Operator updated successfully!');
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


}
