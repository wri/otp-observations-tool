import { NgModule, Injectable } from '@angular/core';
import { RequestOptions, RequestOptionsArgs, RequestMethod, Headers } from '@angular/http';
import { TokenService } from 'app/services/token.service';
import { environment } from 'environments/environment';

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
      options.headers.set('Authorization', `Bearer ${this.tokenService.token}`);
    }
    options.headers.set('OTP-API-KEY', environment.OTP_API_KEY);

    return super.merge(options);
  }
}
