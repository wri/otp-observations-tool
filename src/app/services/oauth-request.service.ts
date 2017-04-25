import { NgModule, Injectable } from '@angular/core';
import { RequestOptions, RequestOptionsArgs, RequestMethod, Headers } from '@angular/http';
import { TokenService } from 'app/services/auth.service';
import { environment } from 'environments/environment.dev';

@Injectable()
export class OauthRequestOptions extends RequestOptions {
  constructor (private tokenService: TokenService) {
    super();

  }

  merge(options?: RequestOptionsArgs): RequestOptions {

    if (!options.headers) {
      options.headers = new Headers();
    }
    if (this.tokenService.token) {
      options.headers.append('Authorization', `Bearer ${this.tokenService.token}`);
    }
    options.headers.append('OTP-API-KEY', environment.OTP_API_KEY);
    options.headers.append('Content-Type', 'application/json');
    return super.merge(options);
  }
}
