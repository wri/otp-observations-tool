
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { TokenService } from 'app/services/token.service';
import { Router } from '@angular/router';


import { ReplaySubject } from 'rxjs';
import { Observer } from 'app/models/observer.model';
import { TranslateService } from '@ngx-translate/core';
import { ObserversService } from 'app/services/observers.service';
import { uniq } from 'lodash';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService {

  public userId: string;
  public userRole: string;
  private _userObserverId: string;
  public managedObserverIds: string[] = [];
  public availableObserverIds: string[] = [];
  public qc1ObserverIds: string[] = [];
  public qc2ObserverIds: string[] = [];
  public userCountryId: string;
  public observerCountriesIds: Number[];
  // Observable of the login status of the user
  private logged$: ReplaySubject<boolean> = new ReplaySubject(1);

  get loginStatus() {
    return this.logged$;
  }

  set userObserverId(val) {
    this._userObserverId = val;
    if (val) {
      localStorage.setItem('userObserverId', val);
    } else {
      localStorage.removeItem('userObserverId');
    }
  }

  get userObserverId() {
    return this._userObserverId;
  }

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router,
    private translateService: TranslateService,
    private observersService: ObserversService
  ) {
  }

  /**
   * Trigger the login status to the component listening to the
   * logged$ observable
   * @param {boolean} isLogged whether or not the user is logged
   */
  triggerLoginStatus(isLogged: boolean) {
    this.logged$.next(isLogged);
  }

  /**
   * Log the user
   * Reject if the login/password combination is wrong, resolve false if the user
   * is not permitted to log in, resolve true if everything's fine
   * @param {string} email user email
   * @param {string} password user password
   * @returns {Promise<boolean>}
   */
  login(email: string, password: string): Promise<boolean> {
    const payload = { auth: { email, password } };

    return this.http.post(`${environment.apiUrl}/login`, payload).pipe(
      map((body: any) => {
        if (!['ngo', 'ngo_manager', 'admin'].includes(body.role)) {
          this.triggerLoginStatus(false);
          return false;
        }

        this.tokenService.token = body.token;
        this.userId = body.user_id;
        this.userRole = body.role;

        this.triggerLoginStatus(true);

        return true;
      })).toPromise();
  }

  /**
   * Check if the user is logged
   * Resolve if the user is logged, reject if not
   * NOTE: this method send a request to the server, if you want to subscribe
   * to login status changes, use loginStatus
   * @returns {Promise<boolean>}
   */
  async isUserLogged(): Promise<boolean> {
    if (!this.tokenService.token) {
      this.triggerLoginStatus(false);
      return false;
    }

    try {
      const response = await this.http.get(`${environment.apiUrl}/users/current-user`).toPromise() as any;
      const relationships = response.data.relationships;
      const userPermissions = (response.included || []).find(i => i.type === 'user-permissions');
      this.userId = response.data.id;
      this.userRole = userPermissions && userPermissions.attributes['user-role'];
      this.qc1ObserverIds = (response.data.attributes['qc1-observer-ids'] || []).map((d) => d.toString());
      this.qc2ObserverIds = (response.data.attributes['qc2-observer-ids'] || []).map((d) => d.toString());
      const userObserverId = relationships.observer.data && relationships.observer.data.id;
      const managedObserverIds = [];
      if (this.isBackendAdmin()) {
        await this.observersService.getAll({ sort: 'name' }).then(data => {
          //set all observers as available
          managedObserverIds.push(...data.map(o => o.id));
        });
      }
      const allManagedOberverIds = uniq([userObserverId, ...managedObserverIds].filter(x => x));
      const availableObserverIds = uniq([...allManagedOberverIds, ...this.qc1ObserverIds, ...this.qc2ObserverIds].filter(x => x));
      const savedUserObserverId = parseInt(localStorage.getItem('userObserverId'), 10);
      this.managedObserverIds = allManagedOberverIds;
      this.availableObserverIds = availableObserverIds;
      if (!isNaN(savedUserObserverId) && (availableObserverIds.includes(savedUserObserverId.toString()) || this.isBackendAdmin())) {
        this.userObserverId = savedUserObserverId.toString();
      } else {
        this.userObserverId = availableObserverIds[0];
      }
      this.userCountryId = relationships.country && relationships.country.data && relationships.country.data.id;

      await this.setObserverCountriesIds();

      const lang: string = response.data.attributes.locale;
      if (lang) {
        this.translateService.use(lang);
      } else {
        this.translateService.use('en');
        alert(await this.translateService.get('noLanguageSet').toPromise());
      }

      // TODO: remove after some time
      // this is migration to keep old draft observation saved in under new key
      // I'm only going to do this for users who manages one observer
      // in different case let's just remove draft
      try {
        const oldDraftObservation = JSON.parse(localStorage.getItem('draftObservation'));
        if (this.managedObserverIds.length === 1 && oldDraftObservation) {
          const key = `draftObservation-${this.userId}-${this.userObserverId}`;
          localStorage.setItem(key, JSON.stringify(oldDraftObservation))
        }
        localStorage.removeItem('draftObservation');
      } catch {
        // in case of error, just remove failing draftObservation
        localStorage.removeItem('draftObservation');
      }

      this.triggerLoginStatus(!!response);
      return !!response;
    } catch (e) {
      console.error(e);
      this.triggerLoginStatus(false);
      return false;
    }
  }

  /**
   * Return whether the current user is an admin
   * NOTE: you shouldn't call this method outside of loginStatus
   * as you'll have the value as a certain time and it can evolve if the user
   * logouts or logins with a different account
   * @returns {boolean}
   */
  isAdmin(): boolean {
    return this.userRole === 'ngo_manager' || this.isBackendAdmin();
  }

  isBackendAdmin(): boolean {
    return this.userRole === 'admin';
  }

  logout() {
    this.tokenService.token = null;
    this.userId = null;
    this.userRole = null;
    this.userObserverId = null;
    this.triggerLoginStatus(false);
    this.router.navigate(['/']);
  }

  recoverPass(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => reject(false));
    // To be updated and reviewed
    // return this.http.post(`${environment.apiUrl}/api/v1/user/${email}/recover-password`, {})
    // .map(response => response.json()).toPromise()
    // .then((body:any) => this.tokenService.token = body.access_token);
  }

  // copy paste from class GovernmentDetailComponent.setDefaultCountry()
  /**
   */
  setObserverCountriesIds() {
    return this.observersService.getById(this.userObserverId, {
      include: 'countries',
      fields: { countries: 'id' } // Just save bandwidth and load fastter
    }).then((observer) => {
      let countries_ids = [];
      (observer.countries || []).forEach((country) => {
        countries_ids.push(parseInt(country['id']));
      });
      this.observerCountriesIds = countries_ids;
    }).catch(err => console.error(err));
  }
}
