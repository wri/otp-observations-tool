import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TokenService {
    private _token: string = null;

    set token(token: string) {
        if (!token) {
            localStorage.removeItem('otp-token');
        } else {
            localStorage.setItem('otp-token', token);
        }
        this._token = token;
    }

    get token() {
        if (!this._token) {
            this._token = localStorage.getItem('otp-token');
        }
        return this._token;
    }
}

@Injectable()
export class AuthService {

    user = null;
    token: string = null;

    constructor(private http: Http, private tokenService: TokenService, private router: Router) {

    }

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
        .map(body => {
            this.user = body;
            return true;
        }).toPromise();

    }

    /**
     * Return whether the current user is an admin
     * @returns {boolean}
     */
    isAdmin(): Promise<boolean> {
      // TODO: we temparily assume that if the user is connected,
      // they are an admin
      return this.checkLogged();
    }

    logout() {
        this.user = null;
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
