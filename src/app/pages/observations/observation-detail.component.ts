import { TranslateService } from '@ngx-translate/core';
import cloneDeep from 'lodash/cloneDeep';
import EXIF from 'exif-js';
import { Law } from 'app/models/law.model';
import { LawsService } from 'app/services/laws.service';
import { ObservationDocument } from 'app/models/observation_document';
import { ObservationReport } from 'app/models/observation_report';
import { Fmu } from 'app/models/fmu.model';
import { AuthService } from 'app/services/auth.service';
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
import * as L from 'leaflet';
import { IMultiSelectOption, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import { GeoJsonObject } from 'geojson';
import { ObservationReportsService } from 'app/services/observation-reports.service';
import { ObservationDocumentsService } from 'app/services/observation-documents.service';

// Fix issues witht the icons of the Leaflet's markers
const DefaultIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
});
L.Marker.prototype.options.icon = DefaultIcon;

@Component({
  selector: 'otp-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss']
})
export class ObservationDetailComponent {
  loading = false;
  observation: Observation = null; // Only for edit mode
  countries: Country[] = [];
  subcategories: Subcategory[] = [];
  severities: Severity[] = [];
  operators: Operator[] = []; // Ordered by name, filtered by country
  governments: Government[] = [];
  observers: Observer[] = []; // Ordered by name
  fmus: Fmu[] = [];
  reports: ObservationReport[] = []; // Ordered by title
  documents: ObservationDocument[] = []; // Sorted by name initially
  documentsToDelete: ObservationDocument[] = []; // Existing document to delete
  documentsToUpload: ObservationDocument[] = []; // New document to upload
  evidence: ObservationDocument = this.datastoreService.createRecord(ObservationDocument, {});
  operatorTypes = [ // Possible types of an operator
    'Logging company', 'Artisanal', 'Community forest', 'Estate',
    'Industrial agriculture', 'Mining company', 'Sawmill', 'Other', 'Unknown'
  ];
  laws: Law[] = []; // Filtered by country and subcategory

  // Map related
  map: L.Map;
  mapOptions = {
    center: [10, 0],
    zoom: 1,
    layers: [
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,
          &copy;<a href="https://carto.com/attribution">CARTO</a>`
      })
    ]
  };
  _mapMarker = null; // Layer with the marker
  _mapFmu = null; // Layer with the FMU

  // Monitors multi-select related
  additionalObserversOptions: IMultiSelectOption[] = [];
  _additionalObserversSelection: number[] = [];

  // Relevant operatos multi-select related
  relevantOperatorsOptions: IMultiSelectOption[] = [];
  _relevantOperatorsSelection: number[] = [];

  // User selection
  _type: string = null;
  _country: Country = null;
  _details: string;
  _severity: Severity = null;
  _subcategory: Subcategory = null;
  _publicationDate: Date;
  operator: Operator = this.datastoreService.createRecord(Operator, { 'operator-type': null });
  _operatorChoice: Operator = null; // Only for type operator, chose between the options
  _opinion: string; // Only for type operator
  _litigationStatus: string; // Only for type operator
  _pv: string; // Only for type operator
  _latitude: number; // Only for type operator
  _longitude: number; // Only for type operator
  _fmu: Fmu = null; // Only for type operator
  _government: Government = null; // Only for type government
  _actions: string;
  _validationStatus: string;
  _locationInformation: string;
  _physicalPlace = true;
  // Report to upload
  report: ObservationReport = this.datastoreService.createRecord(ObservationReport, {});
  // Report choosed between options
  _reportChoice: ObservationReport = null;
  law: Law = null; // Only for type operator

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
      this.government = null;
      this.publicationDate = null;
      this._additionalObserversSelection = [];
      this.actions = null;
    }

    // When the type change we load the necessary additional information
    this.countriesService.getAll(type === 'government' ? { include: 'governments', sort: 'name' } : { sort: 'name' })
      .then(countries => this.countries = countries)
      .then(() => {
        // If we're editing an observation, the object Country of the observation won't
        // match any of the objects of this.countries, so we search for the "same" model
        // and set it
        if (this.observation) {
          this.country = this.countries.find((country) => country.id === this.observation.country.id);
        } else {
          // By default, the selected country is one of the observer's
          this.setDefaultCountry();
        }
      });

    this.subcategoriesService.getByType(<'operator'|'government'>type, { include: 'severities,category' })
      .then(subcategories => this.subcategories = subcategories)
      .then(() => {
          // If we're editing an observation, the object Subcategory of the observation won't
          // match any of the objects of this.subcategories, so we search for the "same" model
          // and set it
          if (this.observation) {
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
      this.governments = country ? country.governments : [];

      if (this.observation && this.country.id === this.observation.country.id) {
        this.government = this.governments.find(government => government.id === this.observation.government.id);
      } else {
        this.government = null;
      }

      if (country) {
        this.operatorsService.getAll({ sort: 'name', filter: { country: country.id } })
          .then((operators) => {
            this.operators = operators;

            // We update the list of options for the relevant operators field
            this._relevantOperatorsSelection = this.observation && this.observation.country.id === country.id
              ? this.observation['relevant-operators'].map(relevantOperator => operators.findIndex(o => o.id === relevantOperator.id))
              : [];
            this.relevantOperatorsOptions = operators
              .map((operator, index) => ({ id: index, name: operator.name }));
          });
      }
    } else {
      // We update the list of operators
      if (country) {
        this.operatorsService.getAll({ sort: 'name', filter: { country: this.country.id } })
          .then(operators => this.operators = operators)
          .then(() => {
            // If we're editing an observation, the object Operator of the observation won't
            // match any of the objects of this.operators, so we search for the "same" model
            // and set it
            if (this.observation && this.observation.country === country) {
              this.operatorChoice = this.operators.find((operator) => operator.id === this.observation.operator.id);
            } else {
              this.operatorChoice = null;
            }
          })
          .catch((err) => console.error(err)); // TODO: visual feedback
      }

      // We update the list of laws
      if (country && this.subcategory) {
        this.lawsService.getAll({ filter: { country: country.id, subcategory: this.subcategory.id } })
          .then(laws => this.laws = laws)
          .then(() => {
            // If we're editing an observation, the object Law of the observation won't
            // match any of the objects of this.laws, so we search for the "same" model
            // and set it
            if (this.observation && this.observation.country === country
              && this.observation.subcategory === this.subcategory) {
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
  }

  get operatorName() { return this.operator.name; }
  set operatorName(operatorName) {
    this.operator.name = operatorName;

    // If the user wants to add a new operator,
    // we discard the choice they've made in the selector
    if (operatorName) {
      this.operatorChoice = null;
    }
  }

  get operatorType() { return this.operator['operator-type']; }
  set operatorType(operatorType) {
    this.operator['operator-type'] = operatorType;

    // If the user wants to add a new operator,
    // we discard the choice they've made in the selector
    if (operatorType) {
      this.operatorChoice = null;
    }
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
          this.fmus = op.fmus ? op.fmus : [];

          // If we can restore the FMU of the observation, we do it,
          // otherwise we just reset the fmu each time the user
          // update the operator
          if (this.observation && this.observation.operator.id === operatorChoice.id && this.observation.fmu) {
            this.fmu = this.fmus.find(fmu => fmu.id === this.observation.fmu.id);
          } else {
            this.fmu = null;
          }
        })
        .catch(err => console.error(err)); // TODO: visual feedback

      // If the user selects an operator, then the new
      // operator is discarded
      this.operatorName = null;
      this.operatorType = null;
    } else {
      this.fmus = [];
      this.fmu = null;
    }
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
    this.severities = subcategory ? subcategory.severities : [];

    if (this.observation && this.subcategory.id === this.observation.subcategory.id) {
      this.severity = this.severities.find(severity => severity.id === this.observation.severity.id);
    } else {
      this.severity = null;
    }

    // We update the list of laws
    if (this.type === 'operator' && subcategory && this.country) {
      this.lawsService.getAll({ filter: { country: this.country.id, subcategory: subcategory.id } })
        .then(laws => this.laws = laws)
        .then(() => {
          // If we're editing an observation, the object Law of the observation won't
          // match any of the objects of this.laws, so we search for the "same" model
          // and set it
          if (this.observation && this.observation.country === this.country
            && this.observation.subcategory === subcategory) {
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

  get latitude() { return this.observation ? this.observation.lat : this._latitude; }
  set latitude(latitude) {
    if (this.observation) {
      this.observation.lat = latitude;
    } else {
      this._latitude = latitude;
    }

    // We create a layer with the marker
    if (this.latitude && this.longitude) {
      this._mapMarker = L.marker([this.latitude, this.longitude]);
    } else {
      this._mapMarker = null;
    }
  }

  get longitude() { return this.observation ? this.observation.lng : this._longitude; }
  set longitude(longitude) {
    if (this.observation) {
      this.observation.lng = longitude;
    } else {
      this._longitude = longitude;
    }

    // We create a layer with the marker
    if (this.latitude && this.longitude) {
      this._mapMarker = L.marker([this.latitude, this.longitude]);
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

  get pv() { return this.observation ? this.observation.pv : this._pv; }
  set pv(pv) {
    if (this.observation) {
      this.observation.pv = pv;
    } else {
      this._pv = pv;
    }
  }

  get government() { return this.observation ? this.observation.government : this._government; }
  set government(government) {
    if (this.observation) {
      this.observation.government = government;
    } else {
      this._government = government;
    }
  }

  get publicationDate() { return this.observation ? this.observation['publication-date'] : this._publicationDate; }
  set publicationDate(publicationDate) {
    if (this.observation) {
      this.observation['publication-date'] = publicationDate;
    } else {
      this._publicationDate = publicationDate;
    }
  }

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
    if (this.observation) {
      this.observation['observation-report'] = reportChoice;
    } else {
      this._reportChoice = reportChoice;
    }

    // If the user selects a report, then the uploaded
    // file is discarded
    if (reportChoice !== null) {
      this.report.attachment = null;
      this.report.title = null;
      this.report['publication-date'] = null;
    }
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

  get physicalPlace() { return this.observation ? this.observation['is-physical-place'] : this._physicalPlace; }
  set physicalPlace(physicalPlace) {
    if (this.observation) {
      this.observation['is-physical-place'] = physicalPlace;
    } else {
      this._physicalPlace = physicalPlace;
    }
  }

  constructor(
    private authService: AuthService,
    private observersService: ObserversService,
    private observationsService: ObservationsService,
    private observationReportsService: ObservationReportsService,
    private observationDocumentsService: ObservationDocumentsService,
    private countriesService: CountriesService,
    private subcategoriesService: SubcategoriesService,
    private operatorsService: OperatorsService,
    private lawsService: LawsService,
    private datastoreService: DatastoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.observersService.getAll({ sort: 'name' })
      .then((observers) => {
        this.observers = observers;

        // We update the list of options for the additional observers field
        this.additionalObserversOptions = observers
          .filter(observer => observer.id !== this.authService.userObserverId)
          .map((observer, index) => ({ id: index, name: observer.name }));
      })
      .catch((err) => console.error(err)); // TODO: visual feedback

    // We load the list of reports we can use
    this.observationReportsService.getAll({
      sort: 'title',
      filter: {observer_id: this.authService.userObserverId }
    }).then(reports => this.reports = reports)
      .then(() => {
          // If we're editing an observation, the object ObservationReport of the observation won't
          // match any of the objects of this.reports, so we search for the "same" model
          // and set it
          if (this.observation) {
            this.reportChoice = this.reports.find((report) => report.id === this.observation['observation-report'].id);
          }
      })
      .catch(err => console.error(err)); // TODO: visual feedback

    // If we edit an existing observation, we have a bit of
    // code to execute
    if (this.route.snapshot.params.id) {
      this.loading = true;

      this.observationsService.getById(this.route.snapshot.params.id, {
        // tslint:disable-next-line:max-line-length
        include: 'country,operator,subcategory,severity,observers,government,modified-user,fmu,observation-report,law,user,relevant-operators'
      }).then((observation) => {
          this.observation = observation;

          // FIXME: angular2-jsonapi should return a Date object but instead return
          // a string for some reason
          this.observation['publication-date'] = new Date(this.observation['publication-date']);
          this.observation['created-at'] = new Date(this.observation['created-at']);
          this.observation['updated-at'] = new Date(this.observation['updated-at']);

          // We set the list of additional observer ids for the additional observers field
          const additionalObserversIds = this.observation.observers
            .filter(observer => observer.id !== this.authService.userObserverId)
            .map(o => o.id);
          this._additionalObserversSelection = this.observers.map((observer, index) => {
            return additionalObserversIds.indexOf(observer.id) !== -1 ? index : null;
          }).filter(v => v !== null);

          // We force some of the attributes to execute the setters
          this.type = this.observation['observation-type'];
          this.latitude = this.observation.lat;
          this.longitude = this.observation.lng;
          this.operatorChoice = this.observation.operator;
        })
        .catch(() => {
          // The only reason the request should fail is that the user
          // don't have the permission to edit this observation
          // In such a case, we redirect them to the 404 page
          this.router.navigate(['/', '404']);
        })
        .then(() => this.loading = false);

      // We load the list of documents
      this.observationDocumentsService.getAll({
        sort: 'name',
        filter: { observation_id: this.route.snapshot.params.id }
      }).then(documents => this.documents = documents)
        .catch(err => console.error(err)); // TODO: visual feedback
    }
  }

  /**
   * Event handler executed when the map is initialized
   * @param {L.Map} map - Instance of the map
   */
  onMapReady(map: L.Map) {
    this.map = map;
    this.map.on('click', this.onClickMap.bind(this));
  }

  /**
   * Event handler executed when the user clicks on the map
   * @param {any} e
   */
  onClickMap(e: any) {
    this.latitude = e.latlng.lat;
    this.longitude = e.latlng.lng;
  }

  onChangePhoto(e: Event) {
    const photo = (<HTMLInputElement>e.target).files[0];
    const self = this;
    EXIF.getData(photo, async function () {
      // We get the coordinated in minutes, seconds
      const minLatitude: any[] = EXIF.getTag(this, 'GPSLatitude');
      const minLongitude: any[] = EXIF.getTag(this, 'GPSLongitude');

      // We determine in for which hemisphere the coordinates are for
      const latitudeRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
      const longitudeRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';

      if (!minLatitude || !minLongitude) {
        alert(await this.translateService.get('imageGeoreference.error').toPromise());
        return;
      }

      const latitude = (latitudeRef === 'N' ? 1 : -1) * self.convertMinutesToDegrees(minLatitude);
      const longitude = (longitudeRef === 'E' ? 1 : -1) * self.convertMinutesToDegrees(minLongitude);

      // We convert them to decimal degrees
      self.latitude = latitude;
      self.longitude = longitude;

      // We zoom in the area
      self.map.setView([latitude, longitude], 8);
    });
  }

  /**
   * Event handler executed when the user changes the list of additional observers
   * NOTE: we can't use a getter/setter model as we do with the other fields because
   * the library doesn't support it:
   * https://github.com/softsimon/angular-2-dropdown-multiselect/issues/273
   * @param {number[]} options
   */
  onChangeAdditionalObserversOptions(options: number[]) {
    this._additionalObserversSelection = options;
  }

  /**
   * Event handler executed when the user changes the list of relevant operators
   * NOTE: we can't use a getter/setter model as we do with the other fields because
   * the library doesn't support it:
   * https://github.com/softsimon/angular-2-dropdown-multiselect/issues/273
   * @param {number[]} options
   */
  onChangeRelevantOperatorsOptions(options: number[]) {
    this._relevantOperatorsSelection = options;
  }

  /**
   * Event handler executed when the user clicks the "Add evidence" button
   */
  onClickAddEvidence() {
    const evidence = this.datastoreService.createRecord(ObservationDocument, {
      name: this.evidence.name,
      attachment: this.evidence.attachment
    });

    // We push the evidence to the array of documents
    this.documents.push(evidence);
    this.documentsToUpload.push(evidence);

    // We reset the model used for the uploading
    // NOTE: we need to create a new model instead of modifying
    // the existing one otherwise evidence will "suffer" the same
    // changes
    this.evidence = this.datastoreService.createRecord(ObservationDocument, {});
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
      // If the document is an existing one, we add it
      // to the list of documents to delete
      this.documentsToDelete.push(cloneDeep(document));
    } else {
      // We get the index of the document within this.documentsToUpload
      documentIndex = this.documentsToUpload.findIndex((d) => {
        return d.name === document.name && d.attachment === document.attachment;
      });

      this.documentsToUpload.splice(documentIndex, 1);
    }
  }

  onCancel(): void {
    // Without relativeTo, the navigation doesn't work properly
    this.router.navigate([this.observation ? '../..' : '..'], { relativeTo: this.route });
  }

  /**
   * Return whether the form is disabled
   * @returns {boolean}
   */
  isDisabled(): boolean {
    const isAdmin = this.authService.isAdmin();

    // The user is creating an observation, the form
    // is not disabled
    if (!this.route.snapshot.params.id) {
      return false;
    }

    if (this.observation['validation-status'] !== 'Created') {
      return true;
    }

    // If the user is an admin and the observation
    // is linked to their organization, then the form is
    // not disabled
    if (isAdmin
      && this.observation.observers.find(o => o.id === this.authService.userObserverId)) {
      return false;
    }

    // If this is a standard user, only the person
    // who edited it can edit it
    return !this.observation.user || this.observation.user.id !== this.authService.userId;
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
   * Upload the operator, if the user created a
   * new one
   * @returns {Promise<{}>}
   */
  uploadOperator(): Promise<{}> {
    return new Promise((resolve, reject) => {
      if (!this.operator.name) {
        // If the user didn't create a new operator,
        // we just resolve
        resolve();
      } else {
        // Otherwise, we upload it
        this.operator.save()
          .toPromise()
          .then(resolve)
          .catch(reject);
      }
    });
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
        // We don't forget to link the country
        // to the operator
        this.operator.country = this.country;

        // Otherwise, we upload the report first
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
   * @returns {Promise<{}>}
   */
  updateDocuments(observation: Observation): Promise<{}> {
    // We create an array of the documents to delete
    const deletePromises = this.documentsToDelete.map((d) => {
      return this.datastoreService.deleteRecord(ObservationDocument, d.id)
        .toPromise();
    });

    // We create an array of the documents to upload
    const uploadPromises = this.documentsToUpload.map((d) => {
      d.observation = observation; // We link the document to the observation
      return d.save().toPromise();
    });

    return Promise.all(deletePromises.concat(<any>uploadPromises));
  }

  async onSubmitForReview() {
    if (window.confirm(await this.translateService.get('observationSubmitForReview').toPromise())) {
      this.validationStatus = 'Ready for revision';
      this.onSubmit();
    }
  }

  onSubmit(): void {
    this.loading = true;

    let observation: Observation;

    if (this.observation) {
      // We update the list of observers
      // NOTE: we make sure to add our own observer
      this.observation.observers = this.observers
        .filter((observer, index) => this._additionalObserversSelection.indexOf(index) !== -1)
        .concat([this.observers.find(o => o.id === this.authService.userObserverId)]);

      if (this.type !== 'operator') {
        this.observation['relevant-operators'] = this.operators
          .filter((operator, index) => this._relevantOperatorsSelection.indexOf(index) !== -1);
      } else {
        if (!this.physicalPlace) {
          this.observation.lat = null;
          this.observation.lng = null;
          this.observation.fmu = null;
        }
      }

      observation = this.observation;
    } else {
      const model: any = {
        'observation-type': this.type,
        'publication-date': new Date(),
        country: this.country,
        subcategory: this.subcategory,
        details: this.details,
        severity: this.severity,
        observers: this.observers.filter((observer, index) => this._additionalObserversSelection.indexOf(index) !== -1),
        'actions-taken': this.actions,
        'validation-status': this.validationStatus,
        'concern-opinion':this.opinion
      };

      if (this.type === 'operator') {
        model.operator = this.operatorChoice;
        model['is-physical-place'] = this.physicalPlace;
        model.lat = this.physicalPlace ? this.latitude : null;
        model.lng = this.physicalPlace ? this.longitude : null;
        model['litigation-status'] = this.litigationStatus;
        model.law = this.law;
        model.pv = this.pv;
        model.fmu = this.physicalPlace ? this.fmu : null;
        model['location-information'] = this.locationInformation;
      } else {
        model.government = this.government;
        model['relevant-operators'] = this.operators.filter((operator, index) => this._relevantOperatorsSelection.indexOf(index) !== -1);
      }

      observation = this.datastoreService.createRecord(Observation, model);
    }

    this.uploadReport()
      .then(() => {
        // If we created a report, we link it to the observation
        if (this.report.id) {
          observation['observation-report'] = this.report;
        } else {
          observation['observation-report'] = this.reportChoice;
        }
      })
      .then(() => this.uploadOperator())
      .then(() => {
        // If we created an operator, we link it to the observation
        if (this.operator.id) {
          observation.operator = this.operator;
        } else {
          observation.operator = this.operatorChoice;
        }
      })
      .then(() => observation.save().toPromise())
      .then(() => this.updateDocuments(observation))
      .then(async () => {
        if (this.observation) {
          alert(await this.translateService.get('observationUpdate.success').toPromise());
        } else {
          alert(await this.translateService.get('observationCreation.success').toPromise());
        }

        this.router.navigate(['/', 'private', 'observations']);
      })
      .catch(async (err) => {
        if (this.observation) {
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
