import { DatastoreService } from 'app/services/datastore.service';
import { TranslateService } from '@ngx-translate/core';
import { Subcategory } from 'app/models/subcategory.model';
import { SubcategoriesService } from 'app/services/subcategories.service';
import { AuthService } from 'app/services/auth.service';
import { CountriesService } from 'app/services/countries.service';
import { Country } from 'app/models/country.model';
import { Law } from 'app/models/law.model';
import { LawsService } from 'app/services/laws.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-law-detail',
  templateUrl: './law-detail.component.html',
  styleUrls: ['./law-detail.component.scss']
})
export class LawDetailComponent {
  isAdmin = false;
  loading = false;
  law: Law = null;
  countries: Country[] = [];
  subcategories: Subcategory[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private translateService: TranslateService,
    private datastoreService: DatastoreService,
    private lawsService: LawsService,
    private countriesService: CountriesService,
    private subcategoriesService: SubcategoriesService
  ) {
    this.isAdmin = this.authService.isAdmin();

    this.subcategoriesService.getAll({ sort: 'name' })
      .then(subcategories => this.subcategories = subcategories)
      .catch((err) => console.error(err)); // TODO: visual feedback

    // If we're editing a law, we need to fetch the model
    // and do a bit more stuff
    if (this.route.snapshot.params.id) {
      this.loading = true;

      this.countriesService.getAll({ sort: 'name' })
      .then(countries => this.countries = countries)
      .catch(err => console.error(err)); // TODO: visual feedback

      this.lawsService.getById(this.route.snapshot.params.id, { include: 'country,subcategory' })
        .then(law => this.law = law)
        .catch(err => console.error(err))
        .then(() => this.loading = false); // TODO: visual feedback
    } else {
      this.law = this.datastoreService.createRecord(Law, {});

      // We need to force some properties to null to correctly display
      // the selectors in the UI
      this.law.country = null;
      this.law.subcategory = null;

      this.countriesService.getAll({ sort: 'name' })
      .then(countries => this.countries = countries)
      .then(() => {
        this.law.country = this.countries.find(c => c.id === this.authService.userCountryId);
      })
      .catch(err => console.error(err)); // TODO: visual feedback
    }
  }

  onSubmit() {
    this.loading = true;

    const isEdition = !!this.law.id;

    this.law.save()
      .toPromise()
      .then(async () => {
        if (isEdition) {
          alert(await this.translateService.get('lawUpdate.success').toPromise());
        } else {
          alert(await this.translateService.get('lawCreation.success').toPromise());
        }

        this.router.navigate(['/', 'private', 'fields', 'laws']);
      })
      .catch(async (err) => {
        if (isEdition) {
          alert(await this.translateService.get('lawUpdate.error').toPromise());
        } else {
          alert(await this.translateService.get('lawCreation.error').toPromise());
        }

        console.error(err);
      })
      .then(() => this.loading = false);
  }

  onCancel() {
    this.router.navigate(['/', 'private', 'fields', 'laws']);
  }

  onClickBack() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

  /**
   * Return whether the logged user can edit the law
   * @returns {boolean}
   */
  canEdit(): boolean {
    if (!this.isAdmin) {
      return false;
    }

    if (!this.route.snapshot.params.id) {
      return true;
    }

    return this.law.country.id === this.authService.userCountryId;
  }

}
