import { ObserversService } from 'app/services/observers.service';
import { AuthService } from 'app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Government } from 'app/models/government.model';
import { DatastoreService } from 'app/services/datastore.service';
import { GovernmentsService } from 'app/services/governments.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'otp-government-detail',
  templateUrl: './government-detail.component.html',
  styleUrls: ['./government-detail.component.scss']
})
export class GovernmentDetailComponent {

  countries: Country[] = [];
  government: Government = null;
  loading = false;
  nameServerError: string = null;

  @Input() useRouter: boolean = true;
  @Input() showActionsOnTop: boolean = true;
  @Input() showSuccessMessage: boolean = true;
  @Input() country: Country = null;
  @Input() uniqueNameErrorMessage: string = null;

  @Output() afterCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() afterSave: EventEmitter<Government> = new EventEmitter<Government>();

  constructor(
    private countriesService: CountriesService,
    private governmentsService: GovernmentsService,
    private datastoreService: DatastoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    if (!this.country) {
      this.countriesService.getAll({ sort: 'name', filter: { id: this.authService.observerCountriesIds } })
        .then(data => this.countries = data)
        .then(() => {
          if (this.government && this.government.id) {
            this.government.country = this.countries.find(c => c.id === this.government.country.id);
          } else if (!(this.useRouter && this.route.snapshot.params.id)) {
            this.government.country = this.countries[0];
          }
        })
        .catch(err => console.error(err)); // TODO: visual feedback
    }

    // If we're editing a government entity, we need to fetch the model
    // and do a bit more stuff
    if (this.useRouter && this.route.snapshot.params.id) {
      this.loading = true;
      this.governmentsService.getById(this.route.snapshot.params.id, { include: 'country' })
        .then(government => this.government = government)
        .then(() => {
          if (this.countries.length) {
            this.government.country = this.countries.find(c => c.id === this.government.country.id);
          }
        })
        .catch(err => console.error(err)) // TODO: visual feedback
        .then(() => this.loading = false);
    } else {
      this.government = this.datastoreService.createRecord(Government, {});
    }

    if (this.country) {
      this.countries = [this.country];
      this.government.country = this.country;
    }
  }

  onCancel(): void {
    this.afterCancel.emit();
    if (this.useRouter) {
      this.router.navigate(['/', 'private', 'fields', 'government-entities']);
    }
  }

  onSubmit(formValues): void {
    this.loading = true;

    const isEdition = !!this.government.id;

    this.government.save()
      .toPromise()
      .then(async (savedGovernment) => {
        if (this.showSuccessMessage) {
          if (isEdition) {
            alert(await this.translateService.get('governmentUpdate.success').toPromise());
          } else {
            alert(await this.translateService.get('governmentCreation.success').toPromise());
          }
        }
        this.afterSave.emit(savedGovernment);
        if (this.useRouter) {
          this.router.navigate(['/', 'private', 'fields', 'government-entities']);
        }
      })
      .catch(async (err) => {
        if (isEdition) {
          alert(await this.translateService.get('governmentUpdate.error').toPromise());
        } else {
          alert(await this.translateService.get('governmentCreation.error').toPromise());
        }
        if (err.errors && err.errors.length > 0) {
          const errorMessages = [];

          err.errors.forEach((error) => {
            if (error.status === '422') {
              if (error.source && error.source.pointer === '/data/attributes/government-entity') {
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
   * Return whether the logged user can edit the government
   * @returns {boolean}
   */
  canEdit(): boolean {
    if (!(this.useRouter && this.route.snapshot.params.id)) {
      return true;
    }
    let countries = this.authService.observerCountriesIds;

    if (countries.length) {
      return countries.includes(parseInt(this.government.country.id));
    } else {
      return this.government.country.id === this.authService.userCountryId;
    }
  }
}
