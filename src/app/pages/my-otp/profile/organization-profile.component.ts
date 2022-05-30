import { ObserversService } from 'app/services/observers.service';
import { AuthService } from 'app/services/auth.service';
import { CountriesService } from 'app/services/countries.service';
import { Country } from 'app/models/country.model';
import { Observer } from 'app/models/observer.model';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

@Component({
  selector: 'otp-organization-profile',
  templateUrl: './organization-profile.component.html',
  styleUrls: ['./organization-profile.component.scss']
})
export class OrganizationProfileComponent {
  isAdmin = false;

  loading = true;
  saveLoading = false;
  showMore = false; // Are we showing all the details?
  observer: Observer = null;
  countries: Country[] = [];
  countriesOptions: IMultiSelectOption[] = [];
  countriesSelection: string[] = [];
  multiSelectTexts: IMultiSelectTexts = {};
  multiSelectSettings: IMultiSelectSettings = {
    enableSearch: true
  };

  constructor(
    private authService: AuthService,
    private observersService: ObserversService,
    private translateService: TranslateService,
    private countriesService: CountriesService,
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.updateMultiSelectTexts();
    Promise.all([
      this.loadObserver(),
      this.loadCountries()
    ]).then(() => {
      this.countriesSelection = this.observer.countries.map((c) => c.id);
    });
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

  /**
   * Load the observer
   */
  loadObserver() {
    const observerId = this.authService.userObserverId;
    return this.observersService.getById(observerId, { include: 'countries', fields: { countries: 'id' } })
      .then(observer => this.observer = observer)
      .catch(err => console.error(err)) // TODO: visual feedback
      .then(() => this.loading = false);
  }

  loadCountries() {
    return this.countriesService.getAll({ sort: 'name' })
      .then(countries => {
        this.countries = countries;
        this.countriesOptions = countries.map(c => ({ id: c.id, name: c.name }));
      })
      .catch(err => console.error(err)); // TODO: visual feedback
  }

  onSubmit(): void {
    this.saveLoading = true;

    // The value may be undefined
    this.observer['public-info'] = !!this.observer['public-info'];
    this.observer.logo = undefined; // This crashes the API otherwise
    this.observer.countries = this.countries.filter(c => this.countriesSelection.includes(c.id));

    this.observer.save()
      .toPromise()
      .then(async () => alert(await this.translateService.get('organizationProfile.success').toPromise()))
      .catch(async () => alert(await this.translateService.get('organizationProfile.error').toPromise()))
      .then(() => this.saveLoading = false);
  }

  onChangeObserverCountries(options: string[]) {
    this.countriesSelection = options;
  }

  onDiscard(): void {
    this.loadObserver();
  }

}
