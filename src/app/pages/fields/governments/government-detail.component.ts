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
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();

    this.countriesService.getAll({ sort: 'name' })
      .then(data => this.countries = data)
      .catch(err => console.error(err)); // TODO: visual feedback

    // If we're editing a government entity, we need to fetch the model
    // and do a bit more stuff
    if (this.route.snapshot.params.id) {
      this.loading = true;
      this.governmentsService.getById(this.route.snapshot.params.id, { include: 'country' })
        .then(government => this.government = government)
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


}
