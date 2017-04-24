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

    login(email: string, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
          // TODO: replace with real logic
          if (email === 'admin@example.com' && password === 'password') {
            this.token = 'heyya';
            resolve(true);
          } else {
            reject(false);
          }
        });
        // return this.http.post(`${environment.apiUrl}/auth`, {
        //     email,
        //     password
        // }).map(response => response.json()).toPromise()
        // .then((body:any) => this.tokenService.token = body.access_token);
    }

    checkLogged(): Promise<boolean> {
        return new Promise((resolve, reject) => {
          // TODO: replace with real logic
          if (this.token) {
            resolve(true);
          } else {
            reject(false);
          }
        });
        // return this.http.get(`${environment.apiUrl}/api/v1/user/me`)
        // .map(response => response.json())
        // .map(body => {
        //     this.user = body;
        //     return true;
        // }).toPromise();
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
