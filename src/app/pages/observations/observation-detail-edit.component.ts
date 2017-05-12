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

  titleText: String = 'Edit observation';
  observation: Observation;
  loading = false;
  countries: Country[];
  governments: Government[];
  observers: Observer[];
  operators: Operator[];
  annexGovernances: AnnexGovernance[];
  annexOperators: AnnexOperator[];
  severities: Severity[];
  dateOptions: DatePickerOptions;
  isGovernance: boolean;
  governmentsLoaded = false;
  subcategoriesLoaded = false;
  observationId: string;

  constructor(
    private countriesService: CountriesService,
    private subCategoriesService: SubCategoriesService,
    private governmentsService: GovernmentsService,
    private observersService: ObserversService,
    private operatorsService: OperatorsService,
    private observationsService: ObservationsService,
    private router: Router,
    private route: ActivatedRoute,
    private http: Http
  ) {
    this.dateOptions = new DatePickerOptions();
    // -- Get observation ID from URL---
    this.observationId = this.route.snapshot.params.id;
  }

  onCancel(): void {
    this.router.navigate(['/private/observations']);
  }

  onSubmit(formValues, event): void {
    event.preventDefault();
    this.loading = true;
    this.observationsService.updateObservation(this.observation).then(
      data => {
        alert('Observation updated successfully!');
        this.loading = false;
        this.router.navigate(['private/observations']);
      }
    ).catch( error => alert(error));
  }

  ngOnInit(): void {
    this.loading = true;

    // ----- COUNTRIES ----
    const promises = [];
    promises.push(this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    ).catch(error => alert(error)));
    // ----- OBSERVERS ----
    promises.push(this.observersService.getAll().then(
      data => {
         this.observers = data;
      }
    ).catch(error => alert(error)));
    Promise.all(promises)
      .then(() => this.loadObservation())
      .catch(error => alert(error));
  }

  loadObservation(): void {
    this.observationsService.getById(this.observationId).then(
      data => {
        this.observation = data;
        this.isGovernance = this.observation.observation_type === 'AnnexGovernance';
        this.loadSubcategories();
    }).catch(error => alert(error));
  }

  loadSubcategories(): void {
    if (this.isGovernance) {
      this.subCategoriesService.getAnnexGovernancesByCountry(this.observation.country.id).then(
        data => {
          this.annexGovernances = data;
          this.loadSeverities();
          this.subcategoriesLoaded = true;
          this.loadGovernments();
          this.loading = false;
      }).catch( error => alert(error));
    } else {
      this.subCategoriesService.getAnnexOperatorsByCountry(this.observation.country.id).then(
        data => {
          this.annexOperators = data;
          this.loadSeverities();
          this.subcategoriesLoaded = true;
          this.loading = false;
      }).catch( error => alert(error));
    }
  }

  loadGovernments(): void {
    this.loading = true;
    this.governmentsService.getByCountry(this.observation.country.id).then(
      data => {
        this.governments = data;
        this.loading = false;
    }).catch( error => alert(error));
  }

  loadOperators(): void {
    this.operatorsService.getByCountry(this.observation.country.id).then(
      data => {
        this.operators = data;
      }
    );
  }

  onAnnexOperatorChange(value): void {
    console.log('onAnnexOperatorChange');
  }

  onAnnexGovernanceChange(value): void {
    console.log('onAnnexGovernanceChange');
  }

  loadSeverities(): void {
    if (this.isGovernance) {
      this.severities = this.annexGovernances.find((val) => {
        return val.id === this.observation.annex_governance.id;
      }).severities;
    } else {
      this.severities = this.annexOperators.find((val) => {
        return val.id === this.observation.annex_operator.id;
      }).severities;
    }
  }

  onCountryChange(value): void {
    this.loadSubcategories();
    this.loadGovernments();
    if (!this.isGovernance) {
      this.loadOperators();
    }
  }

  getSubcategory(value): void {
    if (this.isGovernance) {
      return value.governance_problem;
    } else {
      return value.illegality;
    }
  }

}
