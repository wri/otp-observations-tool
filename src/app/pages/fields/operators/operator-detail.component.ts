import { ObserversService } from 'app/services/observers.service';
import { AuthService } from 'app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { DatastoreService } from 'app/services/datastore.service';
import { Operator } from 'app/models/operator.model';
import { OperatorsService } from 'app/services/operators.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OperatorTypes } from './operator-list.component';

@Component({
  selector: 'otp-operator-detail',
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.scss']
})
export class OperatorDetailComponent {

  isAdmin = false;

  countries: Country[] = [];
  operator: Operator = null;
  operatorTypes = Object.keys(OperatorTypes);
  loading = false;

  @Input() useRouter: boolean = true;
  @Input() showActionsOnTop: boolean = true;
  @Input() showSuccessMessage: boolean = true;
  @Input() longForm: boolean = true;
  @Input() country: Country = null;

  @Output() afterCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() afterSave: EventEmitter<Operator> = new EventEmitter<Operator>();

  get logoUrl() {
    if (this.operator.logo && this.operator.logo.url) {
      return `${environment.apiUrl}${this.operator.logo.url}`;
    }

    return this.operator.logo;
  }

  constructor(
    private countriesService: CountriesService,
    private operatorsService: OperatorsService,
    private datastoreService: DatastoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    if (!this.country) {
      this.countriesService.getAll({ sort: 'name', filter: { id: this.authService.observerCountriesIds } })
        .then((data) => this.countries = data)
        .then(() => {
          if (this.operator && this.operator.id) {
            this.operator.country = this.countries.find(c => c.id === this.operator.country.id);
          } else {
            this.operator.country = this.countries[0];
          }
        })
        .catch(err => console.error(err)); // TODO: visual feedback
    }

    // If we're editing an operator, we need to fetch the model
    // and do a bit more stuff
    if (this.useRouter && this.route.snapshot.params.id) {
      this.loading = true;
      this.operatorsService.getById(this.route.snapshot.params.id, { include: 'country' })
        .then(operator => this.operator = operator)
        .catch(err => console.error(err)) // TODO: visual feedback
        .then(() => this.loading = false);
    } else {
      this.operator = this.datastoreService.createRecord(Operator, {});
    }

    if (this.country) {
      this.countries = [this.country];
      this.operator.country = this.country;
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
              errorMessages.push(error.detail);
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
    if (!this.isAdmin) {
      return false;
    }

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
}
