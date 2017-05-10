import { Injectable } from '@angular/core';

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
