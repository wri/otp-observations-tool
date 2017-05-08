import { Severity } from './../../models/severity.model';
import { Router } from '@angular/router';
import { Operator } from 'app/models/operator.model';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { Observer } from 'app/models/observer.model';
import { Government } from 'app/models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { AnnexGovernance } from 'app/models/annex-governance.model';
import { AnnexOperator } from 'app/models/annex-operator.model';
import { SubCategoriesService } from 'app/services/sub-categories.service';
import { Http } from '@angular/http';
import { CountriesService } from 'app/services/countries.service';
import { Country } from 'app/models/country.model';
import { Component, OnInit } from '@angular/core';
import { DatePickerOptions } from 'ng2-datepicker';

@Component({
  selector: 'otp-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss']
})
export class ObservationDetailComponent implements OnInit {

  private titleText: String = 'New observation';
  private model: any = {};
  private loading = false;
  private returnUrl: string;
  private countries: Country[];
  private governments: Government[];
  private observers: Observer[];
  private operators: Operator[];
  private subCategories: any;
  private severities: Severity[];
  private dateOptions: DatePickerOptions;
  private type: String;
  private governanceSelected: boolean;

  constructor(
    private countriesService: CountriesService,
    private subCategoriesService: SubCategoriesService,
    private governmentsService: GovernmentsService,
    private observersService: ObserversService,
    private operatorsService: OperatorsService,
    private router: Router,
    private http: Http) {

      this.countries = new Array<Country>();
      this.dateOptions = new DatePickerOptions();
      this.type = 'operator';
      this.governanceSelected = false;
  }

  onTypeChange(event): void{
    this.type = event.target.value;
    this.governanceSelected = this.type === 'governance';

    if (this.type === 'operator') {
      this.subCategoriesService.getAllOperators().then(
        data => {
          this.subCategories = data;
        }
      );
    } else if(this.type === 'governance') {
      this.subCategoriesService.getAllGovernances().then(
        data => {
          this.subCategories = data;
        }
      );
    }

    console.log('subcategories', this.subCategories);
  }

  onCancel(): void{
    this.router.navigate(['/private/observations']);
  }

  ngOnInit(): void {
    // ----- COUNTRIES ----
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );
    // ----- SUB CATEGORIES ----
    this.subCategoriesService.getAllOperators().then(
      data => {
        this.subCategories = data;
      }
    );
    // ----- OBSERVERS ----
    this.observersService.getAll().then(
      data => {
         this.observers = data;
      }
    );
    // ----- OPERATORS ----
    this.operatorsService.getAll().then(
      data => {
         this.operators = data;
      }
    );
  }

  onSubCategoryChange(value) {
    this.severities = this.subCategories.find((val) => {
      return val.id === value;
    }).severities;
  }

  getSubcategory(value){
    if (this.governanceSelected) {
      return value.governance_pillar;
    } else {
      return value.illegality;
    }
  }

}
