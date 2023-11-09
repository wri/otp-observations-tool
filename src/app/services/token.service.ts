import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class TokenService {
    private _token: string = null;
    tokenChange = new Subject<string>();

    set token(token: string) {
        if (!token) {
            localStorage.removeItem('otp-token');
        } else {
            localStorage.setItem('otp-token', token);
        }
        this._token = token;
        this.tokenChange.next(this._token);
    }

    get token() {
        if (!this._token) {
            this._token = localStorage.getItem('otp-token');
        }
        return this._token;
    }
}
