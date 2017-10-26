import { AuthService } from 'app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { DatastoreService } from 'app/services/datastore.service';
import { Operator } from 'app/models/operator.model';
import { OperatorsService } from 'app/services/operators.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component } from '@angular/core';
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

    this.countriesService.getAll({ sort: 'name' })
      .then(data => this.countries = data)
      .catch(err => console.error(err)); // TODO: visual feedback

    // If we're editing an operator, we need to fetch the model
    // and do a bit more stuff
    if (this.route.snapshot.params.id) {
      this.loading = true;
      this.operatorsService.getById(this.route.snapshot.params.id, { include: 'country' })
        .then(operator => this.operator = operator)
        .catch(err => console.error(err)) // TODO: visual feedback
        .then(() => this.loading = false);
    } else {
      this.operator = this.datastoreService.createRecord(Operator, {});

      // We need to force some properties to null to correctly display
      // the selectors in the UI
      this.operator.country = null;
    }
  }

  onCancel(): void{
    this.router.navigate(['/', 'private', 'fields', 'operators']);
  }

  onSubmit(formValues): void {
    this.loading = true;

    const isEdition = !!this.operator.id;

    this.operator.save()
      .toPromise()
      .then(async () => {
        if (isEdition) {
          alert(await this.translateService.get('operatorUpdate.success').toPromise());
        } else {
          alert(await this.translateService.get('operatorCreation.success').toPromise());
        }

        this.router.navigate(['/', 'private', 'fields', 'operators']);
      })
      .catch(async (err) => {
        if (isEdition) {
          alert(await this.translateService.get('operatorUpdate.error').toPromise());
        } else {
          alert(await this.translateService.get('operatorCreation.error').toPromise());
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

    return this.operator.country.id === this.authService.userCountryId;
  }


}
