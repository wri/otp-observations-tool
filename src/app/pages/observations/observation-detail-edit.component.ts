import { AnnexGovernance } from './../../models/annex-governance.model';
import { Observation } from 'app/models/observation.model';
import { ObservationsService } from 'app/services/observations.service';
import { Severity } from 'app/models/severity.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Operator } from 'app/models/operator.model';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { Observer } from 'app/models/observer.model';
import { Government } from 'app/models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { AnnexOperator } from 'app/models/annex-operator.model';
import { SubCategoriesService } from 'app/services/sub-categories.service';
import { Http } from '@angular/http';
import { CountriesService } from 'app/services/countries.service';
import { Country } from 'app/models/country.model';
import { Component, OnInit } from '@angular/core';
import { DatePickerOptions } from 'ng2-datepicker';

@Component({
  selector: 'otp-observation-detail-edit',
  templateUrl: './observation-detail-edit.component.html',
  styleUrls: ['./observation-detail-edit.component.scss']
})
export class ObservationDetailEditComponent implements OnInit {

  private titleText: String = 'Edit observation';
  private observation: Observation;
  private loading = false;
  private countries: Country[];
  private governments: Government[];
  private observers: Observer[];
  private operators: Operator[];
  private annexGovernances: AnnexGovernance[];
  private annexOperators: AnnexOperator[];
  private severities: Severity[];
  private dateOptions: DatePickerOptions;
  private isGovernance: boolean;
  private operatorsLoaded = false;
  private observersLoaded = false;
  private countriesLoaded = false;
  private subcategoriesLoaded = false;
  private observationId: string;


  constructor(
    private countriesService: CountriesService,
    private subCategoriesService: SubCategoriesService,
    private governmentsService: GovernmentsService,
    private observersService: ObserversService,
    private operatorsService: OperatorsService,
    private observationsService: ObservationsService,
    private router: Router,
    private route: ActivatedRoute,
    private http: Http) {

      this.dateOptions = new DatePickerOptions();

      // -- Get observation ID from URL---
      this.observationId = this.route.snapshot.params.id;
  }

  onCancel(): void {
    this.router.navigate(['/private/observations']);
  }

  onSubmit(formValues): void {

  }

  ngOnInit(): void {
    this.loading = true;

    // ----- COUNTRIES ----
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
         this.countriesLoaded = true;
         this.loadObservation();
      }
    );
    // ----- OBSERVERS ----
    this.observersService.getAll().then(
      data => {
         this.observers = data;
         this.observersLoaded = true;
         this.loadObservation();
      }
    );
    // ----- OPERATORS ----
    this.operatorsService.getAll().then(
      data => {
         this.operators = data;
         this.operatorsLoaded = true;
         this.loadObservation();
      }
    );
  }

  loadObservation(): void {
    if (this.countriesLoaded && this.operatorsLoaded && this.observersLoaded) {
      this.observationsService.getById(this.observationId).then(
        data => {
          this.observation = data;
          this.isGovernance = this.observation.observation_type === 'AnnexGovernance';
          this.loadSubcategories();
      });
    }
  }

  loadSubcategories(): void {
    if (this.isGovernance) {
      this.subCategoriesService.getAnnexGovernancesByCountry(this.observation.country.id).then(
        data => {
          this.annexGovernances = data;
          this.observation = this.observation;
          this.loading = false;
      });
    } else {
      this.subCategoriesService.getAnnexOperatorsByCountry(this.observation.country.id).then(
        data => {
          this.annexOperators = data;
          this.observation = this.observation;
          this.loading = false;
      });
    }
  }

  onAnnexOperatorChange(value) {
    // this.severities = this.subCategories.find((val) => {
    //   return val.id === value;
    // }).severities;
  }

  onAnnexGovernanceChange(value) {
    // this.severities = this.subCategories.find((val) => {
    //   return val.id === value;
    // }).severities;
  }

  onCountryChange(value) {
    this.governmentsService.getByCountry(value).then(
      data => {
         this.governments = data;
      }
    );;
  }

  getSubcategory(value){
    if (this.isGovernance) {
      return value.governance_problem;
    } else {
      return value.illegality;
    }
  }

}
