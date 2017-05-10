import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from 'environments/environment';
import { TokenService } from 'app/services/token.service';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AuthService {

    userId: string = null;
    admin = false;
    token: string = null;

    constructor(
      private http: Http,
      private tokenService: TokenService,
      private router: Router
    ) {}

    login(email: string, password: string) {
      return this.http.post(`${environment.apiUrl}/login`, {
          auth: {
            email,
            password
          }
        })
        .map(response => response.json())
        .map(body => {
            this.token = body.token;
            this.tokenService.token = body.token;
            return true;
        }).toPromise();
    }

    checkLogged(): Promise<boolean> {
      return this.http.get(`${environment.apiUrl}/users/current-user`)
        .map(response => response.json())
        .map(response => {
          this.userId = response.data.id;
          this.admin = response.included.length && response.included[0].attributes.user_role === 'admin';
          return true;
        }).toPromise();

    }

    /**
     * Return whether the current user is an admin
     * @returns {boolean}
     */
    isAdmin(): Promise<boolean> {
      return new Promise(resolve => resolve(this.admin));
    }

    logout() {
        this.userId = null;
        this.token = null;
        this.tokenService.token = null;
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
