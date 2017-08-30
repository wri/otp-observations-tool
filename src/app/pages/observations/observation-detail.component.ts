import { Observation } from './../../models/observation.model';
import { DatastoreService } from 'app/services/datastore.service';
import { SubcategoriesService } from 'app/services/subcategories.service';
import { Subcategory } from 'app/models/subcategory.model';
import { ObservationsService } from 'app/services/observations.service';
import { Severity } from 'app/models/severity.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Operator } from 'app/models/operator.model';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { Observer } from 'app/models/observer.model';
import { Government } from 'app/models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { Http } from '@angular/http';
import { CountriesService } from 'app/services/countries.service';
import { Country } from 'app/models/country.model';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss']
})
export class ObservationDetailComponent {
  countries: Country[] = [];
  subcategories: Subcategory[] = [];
  severities: Severity[] = [];
  operators: Operator[] = [];
  governments: Government[] = [];

  // User selection
  _type: 'operator'|'government' = null;
  _country: Country = null;
  details: string;
  severity: Severity = null;
  _subcategory: Subcategory = null;
  operator: Operator = null; // Only for type operator
  opinion: string; // Only for type operator
  pv: string; // Only for type operator
  latitude: number; // Only for type operator
  longitude: number; // Only for type operator
  government: Government = null; // Only for type government

  get type() { return this._type; }
  set type(type) {
    this._type = type;

    // When the type change we load the necessary additional information
    this.countriesService.getAll(type === 'government' ? { include: 'governments'} : {})
      .then(countries => this.countries = countries);

    this.subcategoriesService.getByType(type, { include: 'severities' })
      .then(subcategories => this.subcategories = subcategories)
      .catch((err) => console.error(err)); // TODO: visual feedback

    if (type === 'operator') {
      this.operatorsService.getAll()
        .then(operators => this.operators = operators)
        .catch((err) => console.error(err)); // TODO: visual feedback
    }

    // We also reset the different user selections
    this.country = null;
    this.details = null;
    this.subcategory = null;
    this.operator = null;
    this.opinion = null;
    this.pv = null;
    this.government = null;
  }

  get country() { return this._country; }
  set country(country) {
    this._country = country;

    // We automatically update the governments options
    if (this.type === 'government') {
      this.government = null;
      this.governments = country ? country.governments : [];
    }
  }

  get subcategory() { return this._subcategory; }
  set subcategory(subcategory) {
    this._subcategory = subcategory;

    // We automatically update the severities options
    this.severities = subcategory ? subcategory.severities : [];
    this.severity = null;
  }

  constructor(
    private countriesService: CountriesService,
    private subcategoriesService: SubcategoriesService,
    private operatorsService: OperatorsService,
    private datastoreService: DatastoreService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onCancel(): void {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onSubmit(): void {
    const model: any = {
      'observation-type': this.type,
      'publication-date': new Date(),
      'is-active': true,
      country: this.country,
      subcategory: this.subcategory,
      details: this.details,
      severity: this.severity
    };

    if (this.type === 'operator') {
      model.operator = this.operator;
      model.lat = this.latitude;
      model.lng = this.longitude;
      model['concern-opinion'] = this.opinion;
      model.pv = this.pv;
    } else {
      model.government = this.government;
    }

    const observation = this.datastoreService.createRecord(Observation, model);

    observation.save().toPromise()
      .then(() => {
        alert('The observation has been submitted and is awaiting approval.');

        // Without relativeTo, the navigation doesn't work properly
        this.router.navigate(['..'], { relativeTo: this.route });
      })
      .catch((err) => {
        alert('The creation of the observation has been unsuccessful.');
        console.error(err);
      });
  }

}
