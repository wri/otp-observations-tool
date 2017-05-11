import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from 'environments/environment';
import { TokenService } from 'app/services/token.service';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AuthService {

  public userId: string;
  public userRole: string;

  constructor(
    private http: Http,
    private tokenService: TokenService,
    private router: Router
  ) {}

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
          return false;
        }

        this.tokenService.token = body.token;
        this.userId = body.user_id;
        this.userRole = body.role;

        return true;
      }).toPromise();
  }

  /**
   * Check if the user is logged correctly
   * Reject if the user isn't logged, resolve otherwise
   * @returns {Promise<boolean>}
   */
  checkLogged(): Promise<boolean> {
    if (!this.tokenService.token) {
      return new Promise((resolve, reject) => reject());
    }

    return this.http.get(`${environment.apiUrl}/users/current-user`)
      .map(response => true)
      .toPromise();
  }

  /**
   * Return whether the current user is an admin
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
