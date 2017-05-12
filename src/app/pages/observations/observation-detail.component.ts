import { ObservationsService } from 'app/services/observations.service';
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

  titleText: String = 'New observation';
  private model: any = {};
  loading = false;
  private returnUrl: string;
  countries: Country[] = [];
  governments: Government[];
  observers: Observer[];
  operators: Operator[];
  annexGovernances: AnnexGovernance[];
  annexOperators: AnnexOperator[];
  severities: Severity[];
  dateOptions: DatePickerOptions;
  type: String;
  governanceSelected: boolean;
  private selectedCountry: string;

  constructor(
    private countriesService: CountriesService,
    private subCategoriesService: SubCategoriesService,
    private governmentsService: GovernmentsService,
    private observersService: ObserversService,
    private operatorsService: OperatorsService,
    private observationsService: ObservationsService,
    private router: Router,
    private http: Http
  ) {
      this.dateOptions = new DatePickerOptions();
      this.type = 'operator';
      this.governanceSelected = false;
  }

  onTypeChange(event): void{
    this.type = event.target.value;
    this.governanceSelected = this.type === 'AnnexGovernance';
    if (this.selectedCountry) {
      this.onCountryChange(this.selectedCountry);
    }
  }

  onCancel(): void{
    this.router.navigate(['/private/observations']);
  }
  onSubmit(formValues): void{
    const formattedDate = formValues.publication_date.formatted;
    const valuesUpdated = formValues;
    delete valuesUpdated.publication_date;
    valuesUpdated.publication_date = formattedDate;

    this.loading = true;
    this.observationsService.createObservation(valuesUpdated).then(
        data => {
          alert('Observation created successfully!');
          this.loading = false;
          this.router.navigate(['/private/observations']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }

  ngOnInit(): void {
    // ----- COUNTRIES ----
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );

    // ----- OBSERVERS ----
    this.observersService.getAll().then(
      data => {
         this.observers = data;
      }
    );
  }

  onSubCategoryChange(value) {
    this.loadSeverities(value);
  }

  loadSubcategories(countryId): void {
    if (this.governanceSelected) {
      this.subCategoriesService.getAnnexGovernancesByCountry(countryId).then(
        data => {
          this.annexGovernances = data;
        }
      );
    } else if(this.type === 'AnnexGovernance') {
      this.subCategoriesService.getAnnexOperatorsByCountry(countryId).then(
        data => {
          this.annexOperators = data;
        }
      );
    }
  }

  loadGovernments(countryId): void {
    this.governmentsService.getByCountry(countryId).then(
      data => {
         this.governments = data;
      }
    );
  }

  loadOperators(countryId): void {
    this.operatorsService.getByCountry(countryId).then(
      data => {
        this.operators = data;
      }
    );
  }

  loadSeverities(subcategory): void {
    if (this.governanceSelected) {
      this.severities = this.annexGovernances.find((val) => {
        return val.id === subcategory;
      }).severities;
    } else {
      this.severities = this.annexOperators.find((val) => {
        return val.id === subcategory;
      }).severities;
    }
  }

  onCountryChange(value) {
    this.selectedCountry = value;
    this.loadGovernments(value);
    this.loadOperators(value);
    this.loadSubcategories(value);
  }

}
