import { ObserversService } from 'app/services/observers.service';
import { AuthService } from 'app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Government } from 'app/models/government.model';
import { DatastoreService } from 'app/services/datastore.service';
import { GovernmentsService } from 'app/services/governments.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component } from '@angular/core';

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

  constructor(
    private countriesService: CountriesService,
    private governmentsService: GovernmentsService,
    private datastoreService: DatastoreService,
    private observersService: ObserversService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();

    this.countriesService.getAll({ sort: 'name' })
      .then(data => this.countries = data)
      .then(() => {
        if (this.government && this.government.id) {
          this.government.country = this.countries.find(c => c.id === this.government.country.id);
        } else {
          // By default, the selected country is one of the observer's
          this.setDefaultCountry();
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
    this.router.navigate(['/', 'private', 'fields', 'government-entities']);
  }

  onSubmit(formValues): void {
    this.loading = true;

    const isEdition = !!this.government.id;

    this.government.save()
      .toPromise()
      .then(async () => {
        if (isEdition) {
          alert(await this.translateService.get('governmentUpdate.success').toPromise());
        } else {
          alert(await this.translateService.get('governmentCreation.success').toPromise());
        }

        this.router.navigate(['/', 'private', 'fields', 'government-entities']);
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

    return this.government.country.id === this.authService.userCountryId;
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
        this.government.country = this.countries.find(c => c.id === countries[0].id);
      }
    }).catch(err => console.error(err));
  }
}
