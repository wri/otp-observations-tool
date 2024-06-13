import { AuthService } from 'app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { DatastoreService } from 'app/services/datastore.service';
import { Operator, OperatorTypes } from 'app/models/operator.model';
import { OperatorsService } from 'app/services/operators.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { forkJoin ,  Observable } from "rxjs";
import { Fmu } from 'app/models/fmu.model';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import { FmusService } from 'app/services/fmus.service';
import sortBy from 'lodash/sortBy';

@Component({
  selector: 'otp-operator-detail',
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.scss']
})
export class OperatorDetailComponent {
  objectKeys = Object.keys;

  countries: Country[] = [];
  operator: Operator = null;
  operatorTypes = Object.keys(OperatorTypes);
  operatorTypeOptions: any = {};

  loading = false;
  nameServerError: string = null;

  _fmus: Fmu[] = [];
  fmusOptions: IMultiSelectOption[] = [];
  fmusSelection: string[] = [];
  multiSelectTexts: IMultiSelectTexts = {};
  multiSelectSettings: IMultiSelectSettings = {
    enableSearch: true,
    dynamicTitleMaxItems: 8
  };

  @Input() useRouter: boolean = true;
  @Input() showActionsOnTop: boolean = true;
  @Input() showSuccessMessage: boolean = true;
  @Input() longForm: boolean = true;
  @Input() fixedCountry: Country = null;
  @Input() uniqueNameErrorMessage: string = null;

  @Output() afterCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() afterSave: EventEmitter<Operator> = new EventEmitter<Operator>();

  get logoUrl() {
    if (this.operator.logo && this.operator.logo.url) {
      return `${environment.apiUrl}/${this.operator.logo.url}`;
    }

    return this.operator.logo;
  }

  get fmus() {
    return this._fmus;
  }
  set fmus(data) {
    this._fmus = data;
    this.fmusOptions = sortBy(data.map(c => ({ id: c.id, name: c.name })), 'name');
  }

  get country() : Country {
    return this.operator.country;
  }
  set country(country: Country) {
    if (this.operator) {
      this.operator.country = country;

      // API.get('fmus', { locale: lang, 'filter[country]': countryId, 'filter[free]': true })
      if (this.canEditFmus()) {
        this.fmusService.getAll({ 'filter[country]': country.id, 'filter[free]': true }).then((data) => {
          this.fmus = data;
        });
      }
    }
  }

  constructor(
    private countriesService: CountriesService,
    private operatorsService: OperatorsService,
    private fmusService: FmusService,
    private datastoreService: DatastoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    this.updateTranslatedOptions(this.operatorTypes, 'operatorType');
    this.updateMultiSelectTexts();

    this.translateService.onLangChange.subscribe(() => {
      this.updateTranslatedOptions(this.operatorTypes, 'operatorType');
    });
  }

  ngOnInit() {
    // If we're editing an operator, we need to fetch the model
    // and do a bit more stuff
    if (this.useRouter && this.route.snapshot.params.id) {
      this.loading = true;
      this.operatorsService.getById(this.route.snapshot.params.id, { include: 'country,fmus' })
        .then(operator => {
          this.operator = operator;
          this.country = operator.country;
          this.fmus = operator.fmus;
          this.fmusSelection = operator.fmus.map(f => f.id);
        })
        .catch(err => console.error(err)) // TODO: visual feedback
        .then(() => this.loading = false);
    } else {
      this.operator = this.datastoreService.createRecord(Operator, {});
    }

    if (!this.fixedCountry) {
      this.countriesService.getAll({ sort: 'name', filter: { id: this.authService.observerCountriesIds } })
        .then((data) => this.countries = data)
        .then(() => {
          if (!this.operator) return;

          let country = null;
          if (this.operator.id) {
            country = this.countries.find(c => c.id === this.operator.country.id);
          } else {
            country = this.countries[0];
          }
          this.country = country;
        })
        .catch(err => console.error(err)); // TODO: visual feedback
    } else {
      this.countries = [this.fixedCountry];
      this.country = this.fixedCountry;
    }
  }

  onCancel(): void {
    this.afterCancel.emit();
    if (this.useRouter) {
      this.router.navigate(['/', 'private', 'fields', 'operators']);
    }
  }

  onSubmit(formValues): void {
    this.loading = true;

    const isEdition = !!this.operator.id;
    this.nameServerError = null;

    if (this.canEditFmus()) {
      this.operator.fmus = this.fmus.filter(f => this.fmusSelection.includes(f.id));
    }
    this.operator.save()
      .toPromise()
      .then(async (savedOperator) => {
        if (this.showSuccessMessage) {
          if (isEdition) {
            alert(await this.translateService.get('operatorUpdate.success').toPromise());
          } else {
            alert(await this.translateService.get('operatorCreation.success').toPromise());
          }
        }

        this.afterSave.emit(savedOperator);
        if (this.useRouter) {
          this.router.navigate(['/', 'private', 'fields', 'operators']);
        }
      })
      .catch(async (err) => {
        if (isEdition) {
          alert(await this.translateService.get('operatorUpdate.error').toPromise());
        } else {
          alert(await this.translateService.get('operatorCreation.error').toPromise());
        }
        if (err.errors && err.errors.length > 0) {
          const errorMessages = [];

          err.errors.forEach((error) => {
            if (error.status === '422') {
              if (error.source && error.source.pointer === '/data/attributes/name') {
                if (["n'est pas disponible", 'has already been taken'].includes(error.title) && this.uniqueNameErrorMessage) {
                  this.nameServerError = this.uniqueNameErrorMessage;
                } else {
                  this.nameServerError = error.title;
                }
              } else {
                errorMessages.push(error.detail);
              }
            }
          })
          if (errorMessages.length > 0) {
            alert(errorMessages.join('\n'));
          }
        }
        console.error(err);
      })
      .then(() => this.loading = false);
  }

  onClickBack() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

  /**
   * Return whether the logged user can edit the operator
   * @returns {boolean}
   */
  canEdit(): boolean {
    if (!(this.useRouter && this.route.snapshot.params.id)) {
      return true;
    }
    let countries = this.authService.observerCountriesIds;

    if (countries.length) {
      return countries.includes(parseInt(this.operator.country.id));
    } else {
      return this.operator.country.id === this.authService.userCountryId;
    }
  }

  canEditFmus(): boolean {
    return this.canEdit() && Boolean(this.operator && !this.operator.id);
  }

  onChangeFmus(options: string[]) {
    this.fmusSelection = options;
  }

  private async updateMultiSelectTexts() {
    await Promise.all([
      this.translateService.get('multiselect.checked').toPromise(),
      this.translateService.get('multiselect.checkedPlural').toPromise(),
      this.translateService.get('multiselect.defaultTitle').toPromise(),
      this.translateService.get('multiselect.allSelected').toPromise(),
      this.translateService.get('multiselect.searchPlaceholder').toPromise(),
      this.translateService.get('multiselect.searchEmptyResult').toPromise(),
    ]).then(([checked, checkedPlural, defaultTitle, allSelected, searchPlaceholder, searchEmptyResult]) => {
      this.multiSelectTexts = { checked, checkedPlural, defaultTitle, allSelected, searchPlaceholder, searchEmptyResult };
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
}
