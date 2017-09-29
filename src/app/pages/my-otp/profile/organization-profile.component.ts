import { ObserversService } from 'app/services/observers.service';
import { AuthService } from 'app/services/auth.service';
import { DatastoreService } from 'app/services/datastore.service';
import { Observer } from 'app/models/observer.model';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'otp-organization-profile',
  templateUrl: './organization-profile.component.html',
  styleUrls: ['./organization-profile.component.scss']
})
export class OrganizationProfileComponent {

  loading = true;
  saveLoading = false;
  showMore = false; // Are we showing all the details?
  observer: Observer = null;

  constructor(
    private authService: AuthService,
    private observersService: ObserversService,
    private translateService: TranslateService
  ) {
    this.loadObserver();
  }

  /**
   * Load the observer
   */
  loadObserver() {
    const observerId = this.authService.userObserverId;
    this.observersService.getById(observerId)
      .then(observer => this.observer = observer)
      .catch(err => console.error(err)) // TODO: visual feedback
      .then(() => this.loading = false);
  }

  onSubmit(): void {
    this.saveLoading = true;

    this.observer.save()
      .toPromise()
      .then(async () => alert(await this.translateService.get('organizationProfile.success').toPromise()))
      .catch(async () => alert(await this.translateService.get('organizationProfile.error').toPromise()))
      .then(() => this.saveLoading = false);
  }

  onDiscard(): void {
    this.loadObserver();
  }

}
