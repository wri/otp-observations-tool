import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from 'environments/environment';
import { TokenService } from 'app/services/token.service';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class AuthService {

  public userId: string;
  public userRole: string;
  // Observable of the login status of the user
  private logged$: ReplaySubject<boolean> = new ReplaySubject(1);

  get loginStatus() {
    return this.logged$;
  }

  constructor(
    private http: Http,
    private tokenService: TokenService,
    private router: Router
  ) {}

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

    return this.http.post(`${environment.apiUrl}/login`, payload)
      .map(response => response.json())
      .map(body => {
        if (body.role !== 'ngo' && body.role !== 'admin') {
          this.triggerLoginStatus(false);
          return false;
        }

        this.tokenService.token = body.token;
        this.userId = body.user_id;
        this.userRole = body.role;

        this.triggerLoginStatus(true);

        return true;
      }).toPromise();
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
      const response = await this.http.get(`${environment.apiUrl}/users/current-user`)
        .map(data => data.json())
        .toPromise();

      this.userRole = response.included.length && response.included[0].attributes.user_role;
      this.triggerLoginStatus(!!response);
      return !!response;
    } catch (e) {
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
  isAdmin(): Promise<boolean> {
    return new Promise(resolve => {
      resolve(this.userRole === 'admin');
    });
  }

  logout() {
      this.tokenService.token = null;
      this.userId = null;
      this.userRole = null;
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
}
