import { NgModule, Injectable } from '@angular/core';
import { RequestOptions, RequestOptionsArgs, RequestMethod, Headers } from '@angular/http';
import { TokenService } from 'app/services/token.service';
import { environment } from 'environments/environment';

@Injectable()
export class OauthRequestOptions extends RequestOptions {

  locale = localStorage.getItem('lang') || 'en';

  constructor (
    private tokenService: TokenService
  ) {
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

    if (!options.search || !options.search['locale']) {
      if (!options.search) {
        options.search = {};
      }

      options.search['locale'] = this.locale;
      options.search['app'] = 'observations-tool';
    }

    return super.merge(options);
  }
}
