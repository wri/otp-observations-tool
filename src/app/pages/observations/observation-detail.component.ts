import { TranslateService } from '@ngx-translate/core';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';
import flatten from 'lodash/flatten';
import * as EXIF from 'exif-js';
import proj4 from 'proj4';
import { Law } from 'app/models/law.model';
import { LawsService } from 'app/services/laws.service';
import { ObservationDocument } from 'app/models/observation_document';
import { ObservationReport } from 'app/models/observation_report';
import { Fmu } from 'app/models/fmu.model';
import { AuthService } from 'app/services/auth.service';
import { Observation } from './../../models/observation.model';
import { DraftObservation } from 'app/models/draft_observation.interface';
import { DatastoreService } from 'app/services/datastore.service';
import { SubcategoriesService } from 'app/services/subcategories.service';
import { Subcategory } from 'app/models/subcategory.model';
import { ObservationsService } from 'app/services/observations.service';
import { Severity } from 'app/models/severity.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Operator } from 'app/models/operator.model';
import { FmusService } from 'app/services/fmus.service';
import { OperatorsService } from 'app/services/operators.service';
import { ObserversService } from 'app/services/observers.service';
import { Observer } from 'app/models/observer.model';
import { Government } from 'app/models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { CountriesService } from 'app/services/countries.service';
import { Country } from 'app/models/country.model';
import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import { GeoJsonObject } from 'geojson';
import { ObservationReportsService } from 'app/services/observation-reports.service';
import { ObservationDocumentsService } from 'app/services/observation-documents.service';
import { forkJoin ,  Observable ,  interval ,  Subscription } from "rxjs";
import { QualityControl } from 'app/models/quality_control.model';

// Fix issues witht the icons of the Leaflet's markers
const DefaultIcon = L.icon({
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});
L.Marker.prototype.options.icon = DefaultIcon;

interface GeoreferencedPhoto { // Usage georefered photo as evidence
  attachment: string; // Base64 format
  isUsed: boolean;
}

@Component({
  selector: 'otp-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss']
})
export class ObservationDetailComponent implements OnDestroy {
  @ViewChild('evidenceBlock', { static: false }) evidenceBlock: ElementRef;
  @ViewChild('evidenceInput', { static: false }) evidenceInput: ElementRef;
  loading = false;
  objectKeys = Object.keys;
  subscription: Subscription;
  needsRevisionState = 'undecided'; // Options are: undecided, amend, explain
  observation: Observation = null; // Only for edit mode
  draft: DraftObservation = null; // Only for using draft observation
  countries: Country[] = [];
  subcategories: Subcategory[] = [];
  severities: Severity[] = [];
  _operators: Operator[] = []; // Ordered by name, filtered by country
  unknownOperator: Operator = null; // Special unknown operator
  governments: Government[] = [];
  observers: Observer[] = []; // Ordered by name
  _fmus: Fmu[] = [];
  operatorFmus: Fmu[] = [];
  countryFmus: Fmu[] = [];
  reports: ObservationReport[] = []; // Ordered by title
  documents: ObservationDocument[] = []; // Sorted by name initially
  reportDocuments: ObservationDocument[] = []; // Documents of the selected report
  evidence: ObservationDocument = this.datastoreService.createRecord(ObservationDocument, {});
  evidenceTypes = [
    'No evidence', 'Uploaded documents', 'Evidence presented in the report'
  ];
  evidenceTypeOptions: any = {}; // Object of options for evidence type selection
  documentTypes = [ // Possible types of an observation document/evidence
    'Government Documents', 'Company Documents', 'Photos',
    'Testimony from local communities', 'Other'
  ];
  documentTypeOptions: any = {}; // Object of options for document type selection

  evidenceTabs = [{
    id: 'existing',
    name: 'Select from evidence already uploaded from this report',
    nameTranslateKey: 'observation.evidence.selectFromReport'
  }, {
    id: 'new',
    name: 'Upload a new evidence',
    nameTranslateKey: 'observation.evidence.uploadNewEvidence'
  }]
  currentEvidenceTab = this.evidenceTabs[0];
  currentEvidenceTabIndex = 0;

  coordinatesFormats = [
    'Decimal',
    'Degrees and decimal minutes',
    'Sexagesimal',
    'UTM',
  ];
  coordinatesFormatOptions: any = {};
  locationChoice = { // Possible ways to choose a location
    clickMap: 'Estimated location',
    photo: 'GPS coordinates extracted from photo',
    manually: 'Accurate GPS coordinates'
  };
  georeferencedPhoto: GeoreferencedPhoto = {
    attachment: null,
    isUsed: false,
  };

  // Map related
  map: L.Map;
  _mapMarker = null; // Layer with the marker
  _mapFmu = null; // Layer with the FMU

  get mapOptions() {
    if (this.map) {
      return {
        center: [this.map.getCenter().lat, this.map.getCenter().lng],
        zoom: this.map.getZoom(),
        layers: [
          L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            maxZoom: 18,
            noWrap: true,
            attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,
              &copy;<a href="https://carto.com/attribution">CARTO</a>`
          })
        ]
      }
    }

    return {
      center: [10, 0],
      zoom: 3,
      minZoom: 2,
      layers: [
        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
          maxZoom: 18,
          noWrap: true,
          attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,
            &copy;<a href="https://carto.com/attribution">CARTO</a>`
        })
      ]
    };
  }

  currentContextObserver = null;

  // Multi-select options
  multiSelectTexts: IMultiSelectTexts = {};

  // operator/producer select
  operatorsOptions: IMultiSelectOption[] = [];
  operatorsSelectSettings: IMultiSelectSettings = {
    enableSearch: true,
    selectionLimit: 1,
    autoUnselect: true
  };
  operatorsSelection: string[] = [];
  newOperatorModalOpen = false;
  newOperatorModalSelect: string = null;

  // Governments multi-select related
  governmentsOptions: IMultiSelectOption[] = [];
  _governmentsSelection: string[] = [];
  newGovEntityModalOpen = false;

  // Monitors multi-select related
  additionalObserversOptions: IMultiSelectOption[] = [];
  _additionalObserversSelection: string[] = [];
  _additionalObserversSelectionSaved: string[] = []; // for saving when selecting and unselecting report
  additionalObserversSelectSettings: IMultiSelectSettings = {
    enableSearch: true
  }

  // Relevant operatos multi-select related
  relevantOperatorsOptions: IMultiSelectOption[] = [];
  _relevantOperatorsSelection: string[] = [];
  relevantOperatorsSelectSettings: IMultiSelectSettings = {
    enableSearch: true
  }

  // laws options
  _laws: Law[] = []; // Filtered by country and subcategory
  lawsOptions: IMultiSelectOption[] = [];
  lawsSelectSettings: IMultiSelectSettings = {
    dynamicTitleMaxItems: 8,
    selectionLimit: 1,
    autoUnselect: true
  };
  lawsSelection: string[] = [];

  // Language
  languages = {
    'en': 'English',
    'fr': 'Français'
  };
  get locale() {
    return this.observation && this.observation.locale ? this.observation.locale : this.uiLocale;
  }
  get uiLocale() {
    return localStorage.getItem('lang') || 'en';
  }

  // User selection
  _type: string = null;
  _country: Country = null;
  _details: string;
  _evidenceType: string = null;
  _evidenceOnReport: string;
  _severity: Severity = null;
  _subcategory: Subcategory = null;
  _publicationDate: Date;
  _operatorChoice: Operator = null; // Only for type operator, chose between the options
  _opinion: string; // Only for type operator
  _litigationStatus: string; // Only for type operator
  _pv: string; // Only for type operator
  _coordinatesFormat: string = null;
  _hemisphere: string = null;
  _zone: number = null;
  _latitude: number; // Only for type operator
  _longitude: number; // Only for type operator
  _fmu: Fmu = null; // Only for type operator
  _nonConcessionActivity: boolean = false; // Only for type operator
  _government: Government = null; // Only for type government
  _law: Law = null; // Only for type operator
  _actions: string;
  _validationStatus: string;
  _locationInformation: string;
  _locationAccuracy: string;
  _physicalPlace = true;
  // Report to upload
  report: ObservationReport = this.datastoreService.createRecord(ObservationReport, {});
  // Report choosed between options
  _reportChoice: ObservationReport = null;
  _monitorComment: string = null;
  qcState = 'undecided'; // Options are: undecided, reject

  get type() { return this.observation ? this.observation['observation-type'] : this._type; }
  set type(type) {
    if (this.observation) {
      this.observation['observation-type'] = type;
    } else {
      this._type = type;

      // We also reset the different user selections
      this.country = null;
      this.details = null;
      this.subcategory = null;
      this.operatorChoice = null;
      this.opinion = null;
      this.pv = null;
      this._governmentsSelection = [];
      this._additionalObserversSelection = [];
      this.actions = null;
    }

    // When the type change we load the necessary additional information
    this.countriesService.getAll(type === 'government' ? { include: 'governments', sort: 'name' } : { sort: 'name' })
      .then(countries => this.countries = countries)
      .then(() => {
        // If we're editing an observation (or using draft), the object Country of the observation won't
        // match any of the objects of this.countries, so we search for the "same" model
        // and set it
        if (this.draft) {
          this._additionalObserversSelection = this.draft.observers || [];
          this.country = this.countries.find((country) => country.id === this.draft.countryId);
        } else if (this.observation) {
          this.country = this.countries.find((country) => country.id === this.observation.country.id);
        } else {
          // By default, the selected country is one of the observer's
          this.setDefaultCountry();
        }
      });

    this.subcategoriesService.getByType(<'operator' | 'government'>type, { include: 'severities,category' })
      .then(subcategories => this.subcategories = subcategories)
      .then(() => {
        // If we're editing an observation (or using draft), the object Subcategory of the observation won't
        // match any of the objects of this.subcategories, so we search for the "same" model
        // and set it
        if (this.draft && this.draft.subcategoryId) {
          this.subcategory = this.subcategories.find((subcategory) => subcategory.id === this.draft.subcategoryId);
        }
        if (this.observation && this.observation.subcategory) {
          this.subcategory = this.subcategories.find((subcategory) => subcategory.id === this.observation.subcategory.id);
        }
      })
      .catch((err) => console.error(err)); // TODO: visual feedback
  }

  get country() { return this.observation ? this.observation.country : this._country; }
  set country(country) {
    if (this.observation) {
      this.observation.country = country;
    } else {
      this._country = country;
    }

    // We automatically update the governments options
    if (this.type === 'government') {
      this.governments = country && country.governments || [];
      this.governmentsOptions = orderBy(
        this.governments.map((government) => ({ id: government.id, name: government['government-entity'] })),
        [(g) => g.name.toLowerCase()]
      );
      if (this.observation) {
        this._governmentsSelection = this.observation && this.observation.country.id === country.id
          ? (this.observation.governments || []).map(government => government.id)
          : [];
      }
      if (this.draft) {
        this._governmentsSelection = country && this.draft.countryId === country.id && this.draft.governments
          ? this.draft.governments
          : [];
      }
    } else {
      // We update the list of laws
      if (country && this.subcategory) {
        this.lawsService.getAll({ filter: { country: country.id, subcategory: this.subcategory.id } })
          .then(laws => { this.laws = laws; })
          .then(() => {
            // If we're editing an observation (or using draft), the object Law of the observation won't
            // match any of the objects of this.laws, so we search for the "same" model
            // and set it
            if (this.draft && this.draft.countryId === country.id && this.draft.subcategoryId === this.subcategory.id) {
              this.law = this.laws.find(law => law.id === this.draft.lawId);
            } else if (this.observation && this.observation.country === country
              && this.observation.subcategory === this.subcategory && this.observation.law) {
              this.law = this.laws.find(law => law.id === this.observation.law.id);
            } else {
              this.law = null;
            }
          })
          .catch(err => console.error(err)); // TODO: visual feedback
      } else {
        this.laws = [];
        this.law = null;
      }
    }

    if (country) {
      this.fmusService.getAll({ sort: 'name', filter: { country: country.id } })
        .then((fmus) => {
          this.countryFmus = fmus;
        });

      this.operatorsService.getAll({ sort: 'name', filter: { country: country.id } })
        .then((operators) => {
          this.operators = operators;

          if (this.draft) {
            this._relevantOperatorsSelection = this.country && this.draft.countryId === this.country.id && this.draft.relevantOperators
              ? this.draft.relevantOperators.filter(id => this.operators.find(g => g.id === id))
              : [];
          } else if (this.observation) {
            this._relevantOperatorsSelection = this.observation && this.observation.country.id === this.country.id
              ? (this.observation['relevant-operators'] || []).map(o => o.id)
              : [];
          }

          if (this.type === 'operator') {
            if (this.draft && this.draft.countryId === this.country.id) {
              this.operatorChoice = this.operators.find((operator) => operator.id === this.draft.operatorId) || null;
            } else if (this.observation && this.observation.country === this.country && this.observation.operator) {
              this.operatorChoice = this.operators.find((operator) => operator.id === this.observation.operator.id);
            } else {
              this.operatorChoice = null;
            }
          }
        });
    }
  }

  get operators() { return this._operators; }
  set operators(collection) {
    if (this.unknownOperator) {
      this._operators = [this.unknownOperator, ...collection];
    } else {
      this._operators = collection;
    }
    this.operatorsOptions = this._operators.map((o) => ({ id: o.id, name: o.name }));
    this.relevantOperatorsOptions = collection.map((o) => ({ id: o.id, name: o.name }));
  }

  get operatorChoice() { return this.observation ? this.observation.operator : this._operatorChoice; }
  set operatorChoice(operatorChoice) {
    if (this.observation) {
      this.observation.operator = operatorChoice;
    } else {
      this._operatorChoice = operatorChoice;
    }

    if (operatorChoice) {
      this.operatorsService.getById(operatorChoice.id, { include: 'fmus' })
        .then((op) => {
          this.operatorFmus = op.fmus ? op.fmus : [];
          this.resetFmus();
        })
        .catch(err => console.error(err)); // TODO: visual feedback

      this.operatorsSelection = [operatorChoice.id];
    } else {
      this.operatorFmus = [];
      this.resetFmus();
      this.operatorsSelection = [];
    }
  }
  get unknownOperatorSelected() {
    return this.operatorChoice && this.unknownOperator && +this.operatorChoice.id === +this.unknownOperator.id;
  }

  get nonConcessionActivityEnabled() {
    return this.country && this.country.iso === 'COD';
  }

  get nonConcessionActivity() { return this.observation ? this.observation['non-concession-activity'] : this._nonConcessionActivity; }
  set nonConcessionActivity(nonConcessionActivity) {
    if (this.nonConcessionActivityEnabled) {
      this._nonConcessionActivity = nonConcessionActivity;
    } else {
      this._nonConcessionActivity = false;
    }

    if (this.observation) {
      this.observation['non-concession-activity'] = this._nonConcessionActivity;
    }

    this.resetFmus();
    this.fmu = null;
  }

  resetFmus() {
    this.fmus = this.nonConcessionActivity ? this.countryFmus : this.operatorFmus;
  }

  resetFmu() {
    let fmuId = null;
    if (this.draft) {
      fmuId = this.draft.fmuId;
    } else if (this.observation && this.observation.fmu) {
      fmuId = this.observation.fmu.id;
    }

    if (fmuId) {
      if (this.nonConcessionActivity && this.countryFmus.length
        || (!this.nonConcessionActivity && this.operatorFmus.length)) {
          this.fmu = this._fmus.find(fmu => fmu.id === fmuId);
        }
    }
  }

  get fmus() { return this._fmus; }
  set fmus(collection) {
    this._fmus = collection;
    this.resetFmu();
  }

  get fmu() { return this.observation ? this.observation.fmu : this._fmu; }
  set fmu(fmu) {
    // We create the map layer for the FMU and store it
    // NOTE: we can't generate it in the mapLayers getter
    // because:
    //  1. It's not performant
    //  2. The references get lost with the event handlers
    //     and we're enable to attach a click event
    if (fmu && fmu.geojson) {
      const layer = L.geoJSON(<GeoJsonObject>fmu.geojson);
      this._mapFmu = layer;

      // We zoom onto the FMU in two cases:
      //  1. There wasn't any FMU displayed before (and now
      //     there is one)
      //  2. The user changed the FMU
      if (((!this._fmu || !this._fmu.geojson) || this.fmu.id !== fmu.id) && this.map) {
        this.map.fitBounds(layer.getBounds());
      }
    } else {
      this._mapFmu = null;
    }

    if (this.observation) {
      if (this.observation.fmu && this.observation.fmu.id !== fmu.id) {
        // reset latitude and longitude
        this.latitude = null;
        this.longitude = null;
      }
      this.observation.fmu = fmu;
    } else {
      this._fmu = fmu;
    }
  }

  get subcategory() { return this.observation ? this.observation.subcategory : this._subcategory; }
  set subcategory(subcategory) {
    if (this.observation) {
      this.observation.subcategory = subcategory;
    } else {
      this._subcategory = subcategory;
    }

    // We automatically update the severities options
    this.severities = subcategory ? subcategory.severities.sort((a, b) => a.level < b.level ? -1 : 1) : [];

    if (this.draft && this.subcategory && this.subcategory.id === this.draft.subcategoryId) {
      this.severity = this.severities.find(severity => severity.id === this.draft.severityId);
    } else if (this.observation && this.observation.severity && this.subcategory.id === this.observation.subcategory.id) {
      this.severity = this.severities.find(severity => severity.id === this.observation.severity.id);
    } else {
      this.severity = null;
    }

    // We update the list of laws
    if (this.type === 'operator' && subcategory && this.country) {
      this.lawsService.getAll({ filter: { country: this.country.id, subcategory: subcategory.id } })
        .then(laws => this.laws = laws)
        .then(() => {
          // If we're editing an observation (or using draft), the object Law of the observation won't
          // match any of the objects of this.laws, so we search for the "same" model
          // and set it
          if (this.draft && this.draft.countryId === this.country.id && this.draft.subcategoryId === subcategory.id) {
            this.law = this.laws.find(law => law.id === this.draft.lawId);
          } else if (this.observation && this.observation.country === this.country
            && this.observation.subcategory === subcategory && this.observation.law) {
            this.law = this.laws.find(law => law.id === this.observation.law.id);
          } else {
            this.law = null;
          }
        })
        .catch(err => console.error(err)); // TODO: visual feedback
    } else {
      this.laws = [];
      this.law = null;
    }
  }

  get severity() { return this.observation ? this.observation.severity : this._severity; }
  set severity(severity) {
    if (this.observation) {
      this.observation.severity = severity;
    } else {
      this._severity = severity;
    }
  }

  get coordinatesFormat() {
    if (!this._coordinatesFormat && this.observation && this.latitude !== undefined
      && this.latitude !== null && this.longitude !== undefined && this.longitude !== null) {
      return 'Decimal';
    }

    return this._coordinatesFormat;
  }

  set coordinatesFormat(coordinatesFormat) {
    this._coordinatesFormat = coordinatesFormat;
  }

  get hemisphere() {
    return this._hemisphere;
  }

  set hemisphere(hemisphere) {
    this._hemisphere = hemisphere;
  }

  get zone() {
    return this._zone;
  }

  set zone(zone) {
    this._zone = zone;
  }

  get latitude() { return this.observation ? this.observation.lat : this._latitude; }
  set latitude(latitude) {
     // @ts-ignore
    const value = latitude === '' ? null : latitude;
    if (this.observation) {
      this.observation.lat = value;
    } else {
      this._latitude = value;
    }

    const decimalCoordinates = this.getDecimalCoordinates();

    // We create a layer with the marker
    if (decimalCoordinates) {
      this._mapMarker = L.marker(<L.LatLngExpression>decimalCoordinates);
    } else {
      this._mapMarker = null;
    }
  }

  get longitude() { return this.observation ? this.observation.lng : this._longitude; }
  set longitude(longitude) {
    // @ts-ignore
    const value = longitude === '' ? null : longitude;
    if (this.observation) {
      this.observation.lng = value;
    } else {
      this._longitude = value;
    }

    const decimalCoordinates = this.getDecimalCoordinates();

    // We create a layer with the marker
    if (decimalCoordinates) {
      this._mapMarker = L.marker(<L.LatLngExpression>decimalCoordinates);
    } else {
      this._mapMarker = null;
    }
  }

  get details() { return this.observation ? this.observation.details : this._details; }
  set details(details) {
    if (this.observation) {
      this.observation.details = details;
    } else {
      this._details = details;
    }
  }

  get evidenceType() { return this.observation ? this.observation['evidence-type'] : this._evidenceType }
  set evidenceType(evidenceType) {
    if (this.observation) {
      this.observation['evidence-type'] = evidenceType;
    } else {
      this._evidenceType = evidenceType;
    }
  }

  get evidenceOnReport() { return this.observation ? this.observation['evidence-on-report'] : this._evidenceOnReport }
  set evidenceOnReport(evidenceOnReport) {
    if (this.observation) {
      this.observation['evidence-on-report'] = evidenceOnReport;
    } else {
      this._evidenceOnReport = evidenceOnReport;
    }
  }

  get opinion() { return this.observation ? this.observation['concern-opinion'] : this._opinion; }
  set opinion(opinion) {
    if (this.observation) {
      this.observation['concern-opinion'] = opinion;
    } else {
      this._opinion = opinion;
    }
  }

  get litigationStatus() { return this.observation ? this.observation['litigation-status'] : this._litigationStatus; }
  set litigationStatus(litigationStatus) {
    if (this.observation) {
      this.observation['litigation-status'] = litigationStatus;
    } else {
      this._litigationStatus = litigationStatus;
    }
  }

  get laws() { return this._laws; }
  set laws(collection) {
    this._laws = collection;
    this.lawsOptions = collection.map((law) => ({ id: law.id, name: law["written-infraction"] }));
  }

  get law() { return this.observation ? this.observation.law : this._law; }
  set law(law) {
    if (this.observation) {
      this.observation.law = law;
    } else {
      this._law = law;
    }

    if (law) {
      this.lawsSelection = [law.id];
    } else {
      this.lawsSelection = [];
    }
  }

  get pv() { return this.observation ? this.observation.pv : this._pv; }
  set pv(pv) {
    if (this.observation) {
      this.observation.pv = pv;
    } else {
      this._pv = pv;
    }
  }

  get publicationDate() { return this.observation ? this.observation['publication-date'] : this._publicationDate; }

  get actions() { return this.observation ? this.observation['actions-taken'] : this._actions; }
  set actions(actions) {
    if (this.observation) {
      this.observation['actions-taken'] = actions;
    } else {
      this._actions = actions;
    }
  }

  get validationStatus() { return this.observation ? this.observation['validation-status'] : this._validationStatus; }
  set validationStatus(validationStatus) {
    if (this.observation) {
      this.observation['validation-status'] = validationStatus;
    } else {
      this._validationStatus = validationStatus;
    }
  }

  get isObservationPublished() {
    return this.observation && (
      this.observation['validation-status'] === 'Published (no comments)' ||
      this.observation['validation-status'] === 'Published (not modified)' ||
      this.observation['validation-status'] === 'Published (modified)'
    );
  }

  get mapLayers(): any[] {
    const layers = [];

    if (this._mapFmu) {
      layers.push(this._mapFmu);
    }

    if (this._mapMarker) {
      layers.push(this._mapMarker);
    }

    return layers;
  }

  get reportAttachment() { return this.report.attachment; }
  set reportAttachment(attachment) {
    this.report.attachment = attachment;

    // If the user uploads a file, the selected
    // report is discarded
    if (this.reportChoice) {
      this.reportChoice = null;
    }
  }

  get reportChoice() { return this.observation ? (this.observation['observation-report'] || null) : this._reportChoice; }
  set reportChoice(reportChoice) {
    // changing report documents section
    if (reportChoice && reportChoice.id) {
      this.observationDocumentsService.getAll({ filter: { 'observation-report-id': reportChoice.id } }).then((documents) => {
        const notLinkedWithObservation = documents.filter((d) => !((this.observation && this.observation['observation-documents']) || []).find((od) => od.id === d.id));
        this.reportDocuments = orderBy(
          uniqBy(notLinkedWithObservation, 'id'),
          [(d) => d.name.toLowerCase()]
        );
      });
    } else {
      this.reportDocuments = [];
    }
    // remove documents that belongs to different report
    this.documents = this.documents.filter(r => !r['observation-report-id'] || (r['observation-report-id'].toString() === (reportChoice && reportChoice.id)));

    const shouldSaveAdditionalObservers = this.reportChoice === null && reportChoice !== null;
    const shouldRestoreAdditionalObservers = this.reportChoice !== null && reportChoice === null;

    if (this.observation) {
      this.observation['observation-report'] = reportChoice;
    } else {
      this._reportChoice = reportChoice;
    }

    if (shouldRestoreAdditionalObservers && this._additionalObserversSelectionSaved.length > 0) {
      this._additionalObserversSelection = this._additionalObserversSelectionSaved;
    }

    // If the user selects a report, then the uploaded
    // file is discarded
    if (reportChoice !== null && reportChoice !== undefined) {
      this.report.attachment = null;
      this.report.title = null;
      this.report['publication-date'] = null;
      if (shouldSaveAdditionalObservers) {
        this._additionalObserversSelectionSaved = this._additionalObserversSelection;
      }
      this._additionalObserversSelection = (reportChoice.observers || []).map(o => o.id).filter(id => id !== this.authService.userObserverId);
    }
  }

  get isReportChosen() {
    return this.reportChoice || (this.report.attachment && this.report.title && this.report['publication-date']);
  }

  get reportDate() { return this.report['publication-date']; }
  set reportDate(date) {
    const similarReport = this.reports.find(report => report['publication-date'] === date);

    if (similarReport) {
      this.translateService.get('report.duplicate', { reportName: similarReport.title }).toPromise()
        .then(s => alert(s));
    }

    this.report['publication-date'] = date;
  }

  get locationInformation() { return this.observation ? this.observation['location-information'] : this._locationInformation; };
  set locationInformation(locationInformation) {
    if (this.observation) {
      this.observation['location-information'] = locationInformation;
    } else {
      this._locationInformation = locationInformation;
    }
  }

  get locationAccuracy() { return this.observation ? this.observation['location-accuracy'] : this._locationAccuracy; }
  set locationAccuracy(locationAccuracy) {
    if (this.observation) {
      this.observation['location-accuracy'] = locationAccuracy;
    } else {
      this._locationAccuracy = locationAccuracy;
    }
  }

  get physicalPlace() { return this.observation ? this.observation['is-physical-place'] : this._physicalPlace; }
  set physicalPlace(physicalPlace) {
    if (this.observation) {
      this.observation['is-physical-place'] = physicalPlace;
    } else {
      this._physicalPlace = physicalPlace;
    }
  }

  get monitorComment() { return this.observation ? this.observation['monitor-comment'] : this._monitorComment; }
  set monitorComment(monitorComment) {
    if (this.observation) {
      this.observation['monitor-comment'] = monitorComment;
    } else {
      this._monitorComment = monitorComment;
    }
  }

  _qcComment: string = null;
  get qcComment() {
    return this._qcComment;
  }
  set qcComment(value) {
    this._qcComment = value;
  }

  get latestQCComment() {
    if (!this.observation) return null;
    if (!this.observation['quality-controls'] || !this.observation['quality-controls'].length) return null;

    return this.observation['quality-controls'] && orderBy(this.observation['quality-controls'], ['created-at'], ['desc'])[0].comment;
  }

  constructor(
    private authService: AuthService,
    private observersService: ObserversService,
    private observationsService: ObservationsService,
    private observationReportsService: ObservationReportsService,
    private observationDocumentsService: ObservationDocumentsService,
    private countriesService: CountriesService,
    private governmentsService: GovernmentsService,
    private subcategoriesService: SubcategoriesService,
    private operatorsService: OperatorsService,
    private fmusService: FmusService,
    private lawsService: LawsService,
    private datastoreService: DatastoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.updateTranslatedOptions(this.evidenceTypes, 'evidenceType');
    this.updateTranslatedOptions(this.documentTypes, 'documentType');
    this.updateTranslatedOptions(this.coordinatesFormats, 'coordinatesFormat');
    this.evidenceTabs = this.evidenceTabs.map(tab => ({ ...tab, name: this.translateService.instant(tab.nameTranslateKey) }));

    this.updateMultiSelectTexts();

    this.translateService.onLangChange.subscribe(() => {
      this.updateTranslatedOptions(this.evidenceTypes, 'evidenceType');
      this.updateTranslatedOptions(this.documentTypes, 'documentType');
      this.updateTranslatedOptions(this.coordinatesFormats, 'coordinatesFormat');
      this.evidenceTabs = this.evidenceTabs.map(tab => ({ ...tab, name: this.translateService.instant(tab.nameTranslateKey) }));
    });

    this.operatorsService.getAll({ filter: { slug: 'unknown' }}).then((operators) => {
      if (operators.length > 0) {
        this.unknownOperator = operators[0];
      }
    });

    // If we edit an existing observation or we copy an existing observation, we have a bit of
    // code to execute
    if (this.existingObservation) {
      this.loadObservation().then(() => {
        this.loadExtraData(); // we are loading the extra data after the observation is loaded because observer context could change
      });
    } else {
      this.loadExtraData();
      if (this.route.snapshot.params.useDraft) {
        this.draft = this.observationsService.getDraftObservation();
        // Set values from the draft observation
        if (this.draft) {
          this.type = this.draft.observationType;
          this.actions = this.draft.actionsTaken;
          this.details = this.draft.details;
          this.opinion = this.draft.concernOpinion;
          // meaning we have to migrate to new evidence type
          if (this.draft.evidenceType === 'Evidence presented in the report') {
            this.evidenceType = this.draft.evidenceType;
            this.evidenceOnReport = this.draft.evidenceOnReport;
          } else if (this.documentTypes.includes(this.draft.evidenceType)) {
            // old way migrate the data
            this.evidenceType = 'Uploaded documents';
            // TODO: remove attachement after some time and this migration, drafts should expire at some point
            this.documents = this.draft.documents.map(document => this.datastoreService.createRecord(ObservationDocument, {
              name: document.name,
              'document-type': this.draft.evidenceType,
              attachment: document.attachment || document.attachement
            }));
          } else {
            // new way
            this.evidenceType = this.draft.evidenceType;
            this.documents = this.draft.documents.map(document => this.datastoreService.createRecord(ObservationDocument, document));
          }
          // if we were going to upload a new report
          this.report.title = this.draft.reportTitle;
          this.reportAttachment = this.draft.reportAttachment;
          this.reportDate = new Date(this.draft.reportDate);

          if (this.type === 'operator') {
            this.nonConcessionActivity = this.draft.nonConcessionActivity;
            this.physicalPlace = this.draft.isPhysicalPlace;
            this.latitude = this.draft.lat;
            this.longitude = this.draft.lng;
            this.litigationStatus = this.draft.litigationStatus;
            this.pv = this.draft.pv;
            this.locationInformation = this.draft.locationInformation;
            this.locationAccuracy = this.draft.locationAccuracy;
          }
        }
      }

      this.subscription = interval(10000).subscribe(() => {
        this.saveAsDraftObservation();
      });
    }
  }

  async loadObservation() {
    this.loading = true;

    const preloaded = await this.observationsService.getById(this.existingObservation, { fields: { observations: "locale" }});

    return this.observationsService.getById(this.existingObservation, {
      // tslint:disable-next-line:max-line-length
      locale: preloaded.locale || this.uiLocale,
      include: 'country,operator,subcategory,severity,observers,governments,modified-user,fmu,observation-report,observation-documents,law,user,relevant-operators,quality-controls'
    }).then((observation) => {
      // change current observer context if needed to prevent 404 errors

      if (!observation.observers.find(o => o.id === this.authService.userObserverId)) {
        if (observation.observers.find(o => this.authService.availableObserverIds.includes(o.id))) {
          this.authService.userObserverId = observation.observers[0].id;
        } else {
          // observation is not accessible by the current user
          this.router.navigate(['/', '404']);
          return;
        }
      }

      this.observation = observation;
      if (this.route.snapshot.params.copiedId) {
        this.observation.id = undefined;
        this.observation['validation-status'] = undefined;
      }

      // FIXME: angular2-jsonapi should return a Date object but instead return
      // a string for some reason
      this.observation['publication-date'] = new Date(this.observation['publication-date']);
      this.observation['created-at'] = new Date(this.observation['created-at']);
      this.observation['updated-at'] = new Date(this.observation['updated-at']);

      // We set the list of additional observer ids for the additional observers field
      const additionalObserversIds = (this.observation.observers || [])
        .filter(observer => observer.id !== this.authService.userObserverId)
        .map(o => o.id);
      this._additionalObserversSelection = additionalObserversIds;

      // We force some of the attributes to execute the setters
      this.type = this.observation['observation-type'];
      this.latitude = this.observation.lat;
      this.longitude = this.observation.lng;
      this.operatorChoice = this.observation.operator;
      this.reportChoice = this.observation['observation-report'];
      this.documents = this.observation['observation-documents'];
    })
      .catch((err) => {
        console.error(err);
        // The only reason the request should fail is that the user
        // don't have the permission to edit this observation
        // In such a case, we redirect them to the 404 page
        this.router.navigate(['/', '404']);
      })
      .then(() => this.loading = false);
  }

  loadExtraData() {
    this.observersService.getAll({ sort: 'name' })
      .then((observers) => {
        this.observers = observers;

        // We update the list of options for the additional observers field
        this.additionalObserversOptions = observers
          .filter(observer => observer.id !== this.authService.userObserverId)
          .map((observer) => ({ id: observer.id, name: observer.name }));

        this.currentContextObserver = observers.find(o => o.id === this.authService.userObserverId);
      })
      .catch((err) => console.error(err)); // TODO: visual feedback

    // We load the list of reports we can use
    this.observationReportsService.getAll({
      sort: 'title',
      filter: { observer_id: this.authService.userObserverId },
      include: 'observers'
    }).then(reports => this.reports = reports)
      .then(() => {
        // If we're editing an observation (or using draft), the object ObservationReport of the observation won't
        // match any of the objects of this.reports, so we search for the "same" model
        // and set it
        if (this.draft) {
          this.reportChoice = this.reports.find((report) => report.id === this.draft.observationReportId) || null;
        }
        if (this.observation) {
          this.reportChoice = this.reports.find((report) => report.id === this.observation['observation-report'].id);
        }
      })
      .catch(err => console.error(err)); // TODO: visual feedback
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async updateMultiSelectTexts() {
    await Promise.all([
      this.translateService.get('multiselect.checked').toPromise(),
      this.translateService.get('multiselect.checkedPlural').toPromise(),
      this.translateService.get('multiselect.defaultTitle').toPromise(),
      this.translateService.get('multiselect.allSelected').toPromise(),
    ]).then(([checked, checkedPlural, defaultTitle, allSelected]) => {
      this.multiSelectTexts = { checked, checkedPlural, defaultTitle, allSelected };
    });
  }

  private updateTranslatedOptions(phrases: string[], field: string): void {
    this[`${field}Options`] = {};
    const observables: Observable<string | any>[] =
      phrases.map(phrase => this.translateService.get(phrase));
    forkJoin(observables).subscribe((translatedPhrases: string[]) => {
      translatedPhrases.forEach((term, i) => {
        this[`${field}Options`][term] = phrases[i];
      });
    });
  }

  public onChangeEvidenceType(previousType: string, type: string, typeElement: HTMLSelectElement): void {
    this.evidenceType = type;

    if (type !== 'Uploaded documents') {
      this.evidence.name = null;
      this.evidence['document-type'] = null;
      this.evidence.attachment = null;
      this.georeferencedPhoto.isUsed = false;
      this.currentEvidenceTab = this.evidenceTabs[0];
    }
  }

  private canChangeMonitors(): boolean {
    return !Boolean(this.reportChoice);
  }

  private saveAsDraftObservation(): void {
    const draftModel: DraftObservation = {
      observationType: this.type,
      countryId: this.country && this.country.id,
      subcategoryId: this.subcategory && this.subcategory.id,
      details: this.details,
      severityId: this.severity && this.severity.id,
      observers: this._additionalObserversSelection,
      actionsTaken: this.actions,
      validationStatus: this.validationStatus,
      concernOpinion: this.opinion,
      evidenceType: this.evidenceType,
      evidenceOnReport: this.evidenceOnReport,
      documents: this.documents.map(document => ({
        id: document.id,
        name: document.name,
        attachment: document.attachment,
        'document-type': document['document-type'],
        'observation-report-id': document['observation-report-id']
      })),
    };
    if (this.reportChoice) {
      draftModel.observationReportId = this.reportChoice.id;
    } else {
      draftModel.reportTitle = this.report && this.report.title;
      draftModel.reportAttachment = this.reportAttachment && String(this.reportAttachment);
      draftModel.reportDate = this.reportDate || null;
    }

    if (this.type === 'operator') {
      const decimalCoordinates = this.getDecimalCoordinates();

      if (this.operatorChoice) {
        draftModel.operatorId = this.operatorChoice && this.operatorChoice.id;
      }

      draftModel.nonConcessionActivity = this.nonConcessionActivity;
      draftModel.isPhysicalPlace = this.physicalPlace;
      draftModel.lat = this.physicalPlace && decimalCoordinates ? decimalCoordinates[0] : null;
      draftModel.lng = this.physicalPlace && decimalCoordinates ? decimalCoordinates[1] : null;
      draftModel.litigationStatus = this.litigationStatus;
      draftModel.lawId = this.law && this.law.id;
      draftModel.pv = this.pv;
      draftModel.fmuId = this.physicalPlace && this.fmu && this.fmu.id || null;
      draftModel.locationAccuracy = this.physicalPlace ? this.locationAccuracy : null;
      draftModel.locationInformation = this.locationInformation;
      draftModel.relevantOperators = this._relevantOperatorsSelection;
    } else {
      draftModel.governments = this._governmentsSelection;
      draftModel.relevantOperators = this._relevantOperatorsSelection;
    }

    this.observationsService.saveDraftObservation(draftModel);
  }

  /**
   * Event handler executed when the map is initialized
   * @param {L.Map} map - Instance of the map
   */
  onMapReady(map: L.Map) {
    this.map = map;
  }

  private checkCoordinatesValidity(): number[] | boolean {
    let result: number[];
    switch (this.coordinatesFormat) {
      case 'Decimal':
        try {
          result = proj4('WGS84', 'WGS84', [+this.latitude, +this.longitude]);
          break;
        } catch (e) {
          return false;
        }
      case 'Degrees and decimal minutes': {
        const convertCoordinateToDecimal = (coordinate: string) => {
          const convert = (degrees: string, decimalMinutes: string, direction: string) => {
            let res = (+degrees) + (+decimalMinutes / 60);

            if (direction == 'S' || direction == 'W') {
              res *= -1;
            }

            return res;
          };

          var parts = coordinate.split(/[^\d\w\.]+/);
          return convert(parts[0], parts[1], parts[2]);
        };

        try {
          const decimalLatitude = convertCoordinateToDecimal(`${this.latitude}`);
          const decimalLongitude = convertCoordinateToDecimal(`${this.longitude}`);
          result = proj4('WGS84', 'WGS84', [decimalLatitude, decimalLongitude]);
          break;
        } catch (e) {
          return false;
        }
      }
      case 'Sexagesimal': {
        const convertCoordinateToDecimal = (coordinate: string) => {
          const convert = (degrees: string, minutes: string, seconds: string, direction: string) => {
            let res = (+degrees) + (+minutes / 60) + (+seconds / (60 * 60));

            if (direction == 'S' || direction == 'W') {
              res *= -1;
            }

            return res;
          };

          var parts = coordinate.split(/[^\d\w\.]+/);
          return convert(parts[0], parts[1], parts[2], parts[3]);
        };

        try {
          const decimalLatitude = convertCoordinateToDecimal(`${this.latitude}`);
          const decimalLongitude = convertCoordinateToDecimal(`${this.longitude}`);
          result = proj4('WGS84', 'WGS84', [decimalLatitude, decimalLongitude]);
          break;
        } catch (e) {
          return false;
        }
      }
      case 'UTM':
        try {
          // We reverse the final result because the UTM coordinates are given by X first
          // (conventionally the longitude) and then Y (the latitude) which means the result of
          // proj4 is the longitude first and then the latitude
          result = proj4(
            `+proj=utm +zone=${this.zone} +datum=WGS84 +units=m +no_defs ${this.hemisphere === 'South' ? ' +south' : ''}`,
            '+proj=longlat +datum=WGS84 +no_defs', [+this.latitude, +this.longitude],
          ).reverse();
          break;
        } catch (e) {
          return false;
        }
      default:
        return true;
    }

    // result is an array of two numbers: the latitude and the longitude
    if (result[0] < -90 || result[0] > 90 || result[1] < -180 || result[1] > 180) {
      return false;
    }

    return result;
  }

  private getDecimalCoordinates(): number[] {
    if (this.latitude === null || this.longitude === null) return null;

    switch (this.coordinatesFormat) {
      case 'Decimal':
      case 'Degrees and decimal minutes':
      case 'Sexagesimal':
      case 'UTM':
        const decimalCoordinates = this.checkCoordinatesValidity();
        if (!decimalCoordinates) {
          return null;
        }

        return <number[]>decimalCoordinates;
      default:
        return null;
    }
  }

  onChangePhoto(e: any) {
    const photo = e.target.files[0];
    const self = this;

    if (photo) {
      EXIF.getData(photo, async function() {
        // We get the coordinated in minutes, seconds
        const minLatitude: any[] = EXIF.getTag(this, 'GPSLatitude');
        const minLongitude: any[] = EXIF.getTag(this, 'GPSLongitude');

        // We determine in for which hemisphere the coordinates are for
        const latitudeRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
        const longitudeRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';

        if (!minLatitude || !minLongitude) {
          alert(await self.translateService.get('imageGeoreference.error').toPromise());
          return;
        } else {
          self.locationAccuracy = self.locationChoice.photo;
        }

        const latitude = (latitudeRef === 'N' ? 1 : -1) * self.convertMinutesToDegrees(minLatitude);
        const longitude = (longitudeRef === 'E' ? 1 : -1) * self.convertMinutesToDegrees(minLongitude);

        // We convert them to decimal degrees
        self.coordinatesFormat = 'Decimal';
        self.latitude = latitude;
        self.longitude = longitude;

        // We zoom in the area
        self.map.setView([latitude, longitude], 8);
      });
    } else {
      this.georeferencedPhoto.attachment = null;
    }
  }

  public onChangeCoordinates(): void {
    const decimalCoordinates = this.getDecimalCoordinates();
    if (decimalCoordinates) {
      this.locationAccuracy = this.locationChoice.manually;
    }
  }

  public async onChangeReport(event) {
    const selectElement = event.target;
    const newReportId = event.target.value;
    const anyDocumentsFromDifferentReport = this.documents.find(d => d.id && d['observation-report-id'] && d['observation-report-id'].toString() !== newReportId);
    let updateReport = false;

    if (anyDocumentsFromDifferentReport) {
      if (window.confirm(await this.translateService.get('observation.evidence.filesFromDifferentReport').toPromise())) {
        updateReport = true;
      }
    } else {
      updateReport = true;
    }

    if (updateReport) {
      this.reportChoice = this.reports.find(r => r.id === event.target.value);
    } else {
      selectElement.value = this.reportChoice.id;  // back to previous value
    }
  }

  public onChangeEvidence(files: FileList): void {
    const photo: File = files[0];
    this.georeferencedPhoto.isUsed = false;
    if (!photo) {
      this.evidence.attachment = null;
    }
  }

  public uploadAsEvidencePhoto(): void {
    this.georeferencedPhoto.isUsed = true;
    this.evidence.attachment = this.georeferencedPhoto.attachment;
    this.evidenceType = 'Uploaded documents';
    this.currentEvidenceTab = this.evidenceTabs.find(tab => tab.id === 'new');
    this.currentEvidenceTabIndex = this.evidenceTabs.indexOf(this.currentEvidenceTab);
    setTimeout(() => {
      this.evidenceInput.nativeElement.value = '';
      this.evidenceBlock.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  /**
   * Event handler executed when the user changes the list of additional observers
   * NOTE: we can't use a getter/setter model as we do with the other fields because
   * the library doesn't support it:
   * https://github.com/softsimon/angular-2-dropdown-multiselect/issues/273
   * @param {number[]} options
   */
  onChangeAdditionalObserversOptions(options: string[]) {
    this._additionalObserversSelection = options;
  }

  /**
   * Event handler executed when the user changes the list of relevant operators
   * NOTE: we can't use a getter/setter model as we do with the other fields because
   * the library doesn't support it:
   * https://github.com/softsimon/angular-2-dropdown-multiselect/issues/273
   * @param {number[]} options
   */
  onChangeRelevantOperatorsOptions(options: string[]) {
    this._relevantOperatorsSelection = options;
  }

  onChangeGovernmentsOptions(options: string[]): void {
    this._governmentsSelection = options;
  }

  onChangeLawsOptions(options: string[]) {
    this.law = this.laws.find(x => x.id == options[0]);
  }

  onChangeOperatorsOptions(options: string[]) {
    this.operatorChoice = this.operators.find(x => x.id == options[0]);
  }

  onClickAddOperator(selectName) {
    this.newOperatorModalOpen = true;
    this.newOperatorModalSelect = selectName;
  }

  onNewOperatorAdded(operator: Operator) {
    this.newOperatorModalOpen = false;
    if (this.country) {
      this.operatorsService.getAll({ sort: 'name', filter: { country: this.country.id } })
        .then((operators) => {
          this.operators = operators;
          // auto select newly added operator if none selected
          if (this.newOperatorModalSelect === 'operator') {
            if ((this.operatorsSelection || []).length === 0) this.operatorChoice = operator;
          } else if (this.newOperatorModalSelect === 'relevantOperators') {
            this._relevantOperatorsSelection.push(operator.id);
          }
        });
    }
  }

  onNewOperatorModalClosed() {
    this.newOperatorModalOpen = false;
    this.newOperatorModalSelect = null;
  }

  onClickAddGovernanceEntity() {
    this.newGovEntityModalOpen = true;
  }

  onNewGovEntityAdded(govEntity: Government) {
    this.newGovEntityModalOpen = false;
    this.governmentsService.getAll({ filter: { country: this.country.id } }).then((data) => {
      this.governments = data;
      this.governmentsOptions = orderBy(
        this.governments.map((government) => ({ id: government.id, name: government['government-entity'] })),
        [(g) => g.name.toLowerCase()]
      );
      this._governmentsSelection.push(govEntity.id);
    });
  }

  /**
   * Event handler executed when the user clicks the "Add evidence" button
   */
  onClickAddEvidence() {
    const evidence = this.datastoreService.createRecord(ObservationDocument, {
      name: this.evidence.name,
      ['document-type']: this.evidence['document-type'],
      attachment: this.evidence.attachment
    });

    // We push the evidence to the array of documents
    this.documents.push(evidence);

    // We reset the model used for the uploading
    // NOTE: we need to create a new model instead of modifying
    // the existing one otherwise evidence will "suffer" the same
    // changes
    this.evidence = this.datastoreService.createRecord(ObservationDocument, {});
    this.georeferencedPhoto.isUsed = false;
  }

  onClickAddReportDocument(document: ObservationDocument) {
    let documentIndex = this.reportDocuments.findIndex(d => d === document);
    this.reportDocuments.splice(documentIndex, 1);
    document.fromReportLibrary = true;
    this.documents.push(document);
  }

  async onClickRemoveReportDocument(document: ObservationDocument) {
    if (window.confirm(await this.translateService.get('observation.evidence.removalNotification').toPromise())) {
      try {
        const fetchedDocument = await this.datastoreService.findRecord(
          ObservationDocument, document.id, { include: 'observations', fields: { observations: 'id' } }
        ).toPromise();
        const otherObservationsLinkedIds = (fetchedDocument.observations || []).filter(x => x.id !== this.observation.id).map(x => x.id);
        if (otherObservationsLinkedIds.length > 0) {
          alert(await this.translateService.get('observation.evidence.cannotRemoveNotification', { ids: otherObservationsLinkedIds }).toPromise());
        } else {
          await this.datastoreService.deleteRecord(ObservationDocument, document.id).toPromise();
          let documentIndex = this.reportDocuments.findIndex(d => d === document);
          this.reportDocuments.splice(documentIndex, 1);
        }
      } catch {
        alert(await this.translateService.get('observation.evidence.removalError').toPromise());
      }
    }
  }
  /**
   * Event handler executed when the user clicks the delete button
   * of an evidence
   * @param {ObservationDocument} document Document from this.document
   */
  onClickDeleteDocument(document: ObservationDocument) {
    let documentIndex = this.documents.findIndex(d => d === document);

    // We remove the document from the list displayed
    // in the UI
    this.documents.splice(documentIndex, 1);

    if (document.id) {
      this.reportDocuments.push(document);
      this.reportDocuments = orderBy(this.reportDocuments, [(d) => d.name.toLowerCase()]);
    }
  }

  onCancel(): void {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([(this.observation && !this.isCopied) ? '../..' : '..'], { relativeTo: this.route });
  }

  onClickAmend(): void {
    this.needsRevisionState = 'amend';
  }

  onClickExplainAndPublish(): void {
    this.needsRevisionState = 'explain';
  }

  onChangeEvidenceTab(tab) {
    this.currentEvidenceTab = tab;
  }

  /**
   * Return whether the form is disabled
   * @returns {boolean}
   */
  isDisabled(): boolean {
    if (!this.observation) return false;
    if (!this.authService.managedObserverIds.includes(this.authService.userObserverId)) return true;

    const isHidden = this.observation.hidden;
    const isCreating = !this.route.snapshot.params.id;
    const isDuplicating = !!this.route.snapshot.params.copiedId;
    const isAmending = this.needsRevisionState === 'amend';
    const isCreated = this.observation['validation-status'] === 'Created';
    const isReadyForQC = ['Ready for QC1', 'Ready for QC2'].includes(this.observation['validation-status']);
    const isQCInProgress = ['QC1 in progress', 'QC2 in progress'].includes(this.observation['validation-status']);
    const isRejected = this.observation['validation-status'] === 'Rejected';
    const isInNeedOfRevision = this.observation['validation-status'] === 'Needs revision';
    const isReadyForPublication = this.observation['validation-status'] === 'Ready for publication';
    const isPublishedWithCommentsAndModified = this.observation['validation-status'] === 'Published (modified)';
    const isPublishedWithCommentsAndNotModified = this.observation['validation-status'] === 'Published (not modified)';
    const isPublishedWithoutComments = this.observation['validation-status'] === 'Published (no comments)';
    const isUserLinkedObserver = !!this.observation.observers.find(o => o.id === this.authService.userObserverId);

    if (isHidden) return true;
    if (isCreating) return false;
    if (isDuplicating) return false;
    if (isCreated && isUserLinkedObserver) return false;
    if (isRejected && isUserLinkedObserver) return false;
    if (isReadyForQC) return true;
    if (isQCInProgress) return true;
    if (isInNeedOfRevision && isUserLinkedObserver && isAmending) return false;
    if (isReadyForPublication) return true;
    if (isPublishedWithCommentsAndModified && isUserLinkedObserver && isAmending) return false;
    if (isPublishedWithCommentsAndNotModified && isUserLinkedObserver && isAmending) return false;
    if (isPublishedWithoutComments && isUserLinkedObserver && isAmending) return false;

    return true;
  }

  public get isCopied(): boolean {
    return this.observation && this.route.snapshot.params.copiedId;
  }

  public get existingObservation(): string {
    return this.route.snapshot.params.id || this.route.snapshot.params.copiedId;
  }

  canStartQC() {
    if (!this.observation) return false;

    const isReadyForQC1 = this.observation['validation-status'] === 'Ready for QC1';
    const isReadyForQC2 = this.observation['validation-status'] === 'Ready for QC2';

    const isUserEligibleForQC1 = !!this.observation.observers.find(o => this.authService.qc1ObserverIds.includes(o.id));
    const isUserEligibleForQC2 = !!this.observation.observers.find(o => this.authService.qc2ObserverIds.includes(o.id));

    if (isReadyForQC1 && isUserEligibleForQC1) return true;
    if (isReadyForQC2 && isUserEligibleForQC2) return true;

    return false;
  }

  canQC() {
    return this.canQC1() || this.canQC2();
  }

  canQC1() {
    if (!this.observation) return false;

    const isInQC1 = this.observation['validation-status'] === 'QC1 in progress';
    const isUserEligibleForQC1 = !!this.observation.observers.find(o => this.authService.qc1ObserverIds.includes(o.id));

    if (isInQC1 && isUserEligibleForQC1) return true;

    return false;
  }

  canQC2() {
    if (!this.observation) return false;

    const isInQC2 = this.observation['validation-status'] === 'QC2 in progress';
    const isUserEligibleForQC2 = !!this.observation.observers.find(o => this.authService.qc2ObserverIds.includes(o.id));

    if (isInQC2 && isUserEligibleForQC2) return true;

    return false;
  }

  canGoBack() {
    const isDisabled = this.isDisabled();

    if (isDisabled) return true;

    return false;
  }

  canManage() {
    return this.authService.managedObserverIds.includes(this.authService.userObserverId);
  }

  canCancel() {
    if (!this.observation) return true;

    const isDuplicating = this.isCopied;
    const isCreated = this.observation['validation-status'] === 'Created';

    if (!this.observation) return true;
    if (isDuplicating) return true;
    if (isCreated) return true;

    return false;
  }

  canCreate() {
    const isDisabled = this.isDisabled();
    const isDuplicating = this.isCopied;

    if (!this.canManage()) return false;
    if (!isDisabled && !this.observation) return true;
    if (isDuplicating) return true;

    return false;
  }

  canAmend() {
    if (!this.observation) return false;
    if (this.observation.hidden) return false;
    if (!this.canManage()) return false;

    const isAmending = this.needsRevisionState === 'amend';
    const isPublishedWithCommentsAndModified = this.observation['validation-status'] === 'Published (modified)';
    const isPublishedWithCommentsAndNotModified = this.observation['validation-status'] === 'Published (not modified)';
    const isPublishedWithoutComments = this.observation['validation-status'] === 'Published (no comments)';

    if (isPublishedWithCommentsAndModified && !isAmending) return true;
    if (isPublishedWithCommentsAndNotModified && !isAmending) return true;
    if (isPublishedWithoutComments && !isAmending) return true;

    return false;
  }

  canSubmitForReview(): boolean {
    const isCreating = !this.observation;
    const isDuplicating = this.isCopied;

    if (isCreating) return true;
    if (isDuplicating) return true;
    if (this.observation.hidden) return false;
    if (!this.canManage()) return false;

    const isAdmin = this.authService.isAdmin();
    const isOwner = this.observation.user && this.observation.user.id === this.authService.userId;
    const isUserLinkedObserver = !!this.observation.observers.find(o => o.id === this.authService.userObserverId);
    const isAmending = this.needsRevisionState === 'amend';
    const isCreated = this.observation['validation-status'] === 'Created';
    const isInNeedOfRevision = this.observation['validation-status'] === 'Needs revision';
    const isRejected = this.observation['validation-status'] === 'Rejected';
    const isPublishedWithCommentsAndModified = this.observation['validation-status'] === 'Published (modified)';
    const isPublishedWithCommentsAndNotModified = this.observation['validation-status'] === 'Published (not modified)';
    const isPublishedWithoutComments = this.observation['validation-status'] === 'Published (no comments)';

    if (isCreated && isAdmin && isUserLinkedObserver) return true;
    if (isCreated && isOwner) return true;
    if (isRejected && isUserLinkedObserver) return true;
    if (isInNeedOfRevision && isAmending) return true
    if (isPublishedWithCommentsAndModified && isAmending) return true;
    if (isPublishedWithCommentsAndNotModified && isAmending) return true;
    if (isPublishedWithoutComments && isAmending) return true;

    return false;
  }

  canSave() {
    if (!this.observation) return false;
    if (!this.canManage()) return false;

    const isCreated = this.observation['validation-status'] === 'Created';

    if (!this.observation) return false;
    if (this.observation.hidden) return false;
    if (isCreated) return true;

    return false;
  }

  canPublishWithoutComments() {
    if (!this.observation) return false;
    if (this.observation.hidden) return false;
    if (!this.canManage()) return false;

    const isReadyForPublication = this.observation['validation-status'] === 'Ready for publication';

    if (isReadyForPublication) return true;

    return false;
  }

  canPublishWithModification() {
    if (!this.observation) return false;
    if (this.observation.hidden) return false;
    if (!this.canManage()) return false;

    const isInNeedOfRevision = this.observation['validation-status'] === 'Needs revision';
    const isAmending = this.needsRevisionState === 'amend';

    if (isInNeedOfRevision && isAmending) return true;

    return false;
  }

  /**
   * Set the default country value based on the observer's
   * locations
   * NOTE: do not call before loading this.countries
   */
  setDefaultCountry() {
    this.observersService.getById(this.authService.userObserverId, {
      include: 'countries',
      fields: { countries: 'id' } // Just save bandwidth and load fastter
    }).then((observer) => {
      const countries = observer.countries;
      if (countries && countries.length) {
        this.country = this.countries.find(c => c.id === countries[0].id);
      }
    }).catch(err => console.error(err));
  }

  /**
   * Convert a coordinate from minutes, seconds to decimal
   * @param {number[]} coordinate
   * @return {number}
   */
  convertMinutesToDegrees(coordinate: number[]) {
    return coordinate
      .map((value, index) => value / Math.pow(60, index))
      .reduce((res, n) => res + n);
  }

  /**
   * Upload the report, if any
   * @returns {Promise<{}>}
   */
  uploadReport(): Promise<{}> {
    return new Promise((resolve, reject) => {
      // If the user doesn't want to upload a report,
      // we just resolve
      if (!this.report.attachment) {
        resolve();
      } else {
        // Otherwise, we upload the report first
        this.report.observers = this.observers
          .filter((observer) => this._additionalObserversSelection.includes(observer.id))
          .concat([this.observers.find(o => o.id === this.authService.userObserverId)]),
        this.report.save()
          .toPromise()
          .then(resolve)
          .catch(reject);
      }
    });
  }

  /**
   * Upload and delete documents according to the
   * user choice
   * @param {Observation} observation Existing observation in the database
   * @returns {Promise<any>}
   */
  updateDocuments(observation: Observation): Promise<any> {
    // We create an array of the documents to upload
    if (this.evidenceType !== 'Uploaded documents') return Promise.resolve();

    const documentsToUploadOrLink = this.documents.filter((d) => !d.id || !d['observation-report-id']);
    const uploadOrLinkPromises = documentsToUploadOrLink.map((d) => {
      d['observation-report'] = observation['observation-report']; // We link the document to the report
      return d.save().toPromise();
    });

    return Promise.all(uploadOrLinkPromises);
  }

  async onSubmitForReview() {
    if (window.confirm(await this.translateService.get('observationSubmitForReview').toPromise())) {
      this.validationStatus = 'Ready for QC'
      this.onSubmit();
    }
  }

  async onPublish(validationStatus) {
    if (window.confirm(await this.translateService.get('observationPublish').toPromise())) {
      const oldValidationStatus = this.validationStatus;
      this.validationStatus = validationStatus;
      this.updateObservation(
        () => this.router.navigate(['/', 'private', 'observations']),
        () => {
          this.validationStatus = oldValidationStatus;
        }
      );
    }
  }

  async onStartQC() {
    if (!this.canStartQC()) return;

    const oldValidationStatus = this.validationStatus;
    this.validationStatus = 'QC in progress';
    this.updateObservation(
      null,
      () => {
        this.validationStatus = oldValidationStatus;
      }
    );
  }

  onCancelRejectQC() {
    this.qcState = 'undecided';
  }

  async onRejectQC() {
    if (this.qcState === 'undecided') {
      this.qcState = 'reject';
    } else {
      const qualityControl = this.datastoreService.createRecord(QualityControl, {
        reviewable: this.observation,
        comment: this.qcComment,
        passed: false
      });
      this.saveQualityControl(qualityControl);
    }
  }

  async onApproveQC() {
    if (!window.confirm("Do you really want to accept this observation?")) return;

    const qualityControl = this.datastoreService.createRecord(QualityControl, {
      reviewable: this.observation,
      passed: true
    });
    this.saveQualityControl(qualityControl);
  }

  saveQualityControl(qc: QualityControl) {
    qc.save().toPromise().then(() => {
      this.router.navigate(['/', 'private', 'observations']);
    })
    .catch(async (err) => {
      let message = await this.translateService.get('observationUpdate.error').toPromise();
      if (err.errors && err.errors.length) {
        console.log('join');
        message += '\n' + err.errors.map(e => e.status + " : " + e.title).join('\n');
      }
      alert(message);
      console.error(err);
    })
  }

  updateObservation(onSuccess?: () => void, onError?: () => void) {
    this.loading = true;
    this.observation.save({ locale: this.observation.locale }).toPromise()
      .then(() => {
        onSuccess && onSuccess();
      })
      .catch(async (err) => {
        alert(await this.translateService.get('observationUpdate.error').toPromise());
        console.error(err);
        onError && onError();
      })
      .then(() => this.loading = false);
  }

  onSubmit(): void {
    this.loading = true;

    let observation: Observation;

    if (this.observation && !this.isCopied) {
      // We update the list of observers
      // NOTE: we make sure to add our own observer
      this.observation.observers = this.observers
        .filter((observer) => this._additionalObserversSelection.includes(observer.id))
        .concat([this.observers.find(o => o.id === this.authService.userObserverId)]);

      if (this.type !== 'operator') {
        this.observation.governments = this.governments.filter((government) => this._governmentsSelection.includes(government.id));
      } else {
        if (!this.physicalPlace) {
          this.observation.lat = null;
          this.observation.lng = null;
          this.observation.fmu = null;
        } else {
          const decimalCoordinates = this.getDecimalCoordinates();
          this.observation.lat = decimalCoordinates && decimalCoordinates[0];
          this.observation.lng = decimalCoordinates && decimalCoordinates[1];
        }
      }
      this.observation['relevant-operators'] = this.operators.filter((operator) => this._relevantOperatorsSelection.includes(operator.id));
      this.observation['validation-status'] = this.validationStatus;

      observation = this.observation;
    } else {
      const model: any = {
        'observation-type': this.type,
        'publication-date': new Date(),
        country: this.country,
        subcategory: this.subcategory,
        details: this.details,
        severity: this.severity,
        observers: this.observers
          .filter((observer) => this._additionalObserversSelection.includes(observer.id))
          .concat([this.observers.find(o => o.id === this.authService.userObserverId)]),
        'actions-taken': this.actions,
        'validation-status': this.validationStatus,
        'concern-opinion': this.opinion,
        'evidence-type': this.evidenceType,
        'evidence-on-report': this.evidenceOnReport
      };

      if (this.type === 'operator') {
        const decimalCoordinates = this.getDecimalCoordinates();

        model.operator = this.operatorChoice;
        model['non-concession-activity'] = this.nonConcessionActivityEnabled ? this.nonConcessionActivity : false;
        model['is-physical-place'] = this.physicalPlace;
        model.lat = this.physicalPlace && decimalCoordinates ? decimalCoordinates[0] : null;
        model.lng = this.physicalPlace && decimalCoordinates ? decimalCoordinates[1] : null;
        model['litigation-status'] = this.litigationStatus;
        model.law = this.law;
        model.pv = this.pv;
        model.fmu = this.physicalPlace ? this.fmu : null;
        model['location-accuracy'] = this.locationAccuracy;
        model['location-information'] = this.locationInformation;
      } else {
        model.governments = this.governments.filter((government) => this._governmentsSelection.includes(government.id));
      }
      model['relevant-operators'] = this.operators.filter((operator) => this._relevantOperatorsSelection.includes(operator.id));
      model.locale = this.locale;

      observation = this.datastoreService.createRecord(Observation, model);
    }

    observation['non-concession-activity'] = this.nonConcessionActivityEnabled ? this.nonConcessionActivity : false;

    this.uploadReport()
      .then(() => {
        // If we created a report, we link it to the observation
        if (this.report.id) {
          observation['observation-report'] = this.report;
        } else {
          observation['observation-report'] = this.reportChoice;
        }
      })
      .then(() => this.updateDocuments(observation))
      .then(() => {
        observation['observation-documents'] = this.documents;
      })
      .then(() => observation.save({ locale: observation.locale }).toPromise())
      .then(async () => {
        if (this.observation && !this.isCopied) {
          alert(await this.translateService.get('observationUpdate.success').toPromise());
        } else {
          this.observationsService.removeDraftObservation();
          alert(await this.translateService.get('observationCreation.success').toPromise());
        }

        this.router.navigate(['/', 'private', 'observations']);
      })
      .catch(async (err) => {
        if (this.observation && !this.isCopied) {
          alert(await this.translateService.get('observationUpdate.error').toPromise());
        } else {
          alert(await this.translateService.get('observationCreation.error').toPromise());
        }
        console.error(err);
      })
      .then(() => this.loading = false);
  }

  onClickBack() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

}
