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

  isAdmin = false;

  countries: Country[] = [];
  government: Government = null;
  loading = false;

  @Input() useRouter: boolean = true;
  @Input() showActionsOnTop: boolean = true;
  @Input() showSuccessMessage: boolean = true;

  @Output() afterCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() afterSave: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private countriesService: CountriesService,
    private governmentsService: GovernmentsService,
    private datastoreService: DatastoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();

    this.countriesService.getAll({ sort: 'name', filter: { id: this.authService.observerCountriesIds } })
      .then(data => this.countries = data)
      .then(() => {
        if (this.government && this.government.id) {
          this.government.country = this.countries.find(c => c.id === this.government.country.id);
        } else if (!this.route.snapshot.params.id) {
          this.government.country = this.countries[0];
        }
      })
      .catch(err => console.error(err)); // TODO: visual feedback

    // If we're editing a government entity, we need to fetch the model
    // and do a bit more stuff
    if (this.route.snapshot.params.id) {
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

      // We need to force some properties to null to correctly display
      // the selectors in the UI
      this.government.country = null;
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
      .then(async () => {
        if (this.showSuccessMessage) {
          if (isEdition) {
            alert(await this.translateService.get('governmentUpdate.success').toPromise());
          } else {
            alert(await this.translateService.get('governmentCreation.success').toPromise());
          }
        }
        this.afterSave.emit();
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
    if (!this.isAdmin) {
      return false;
    }

    if (!this.route.snapshot.params.id) {
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
