import { NgModule, Inject, Injectable, LOCALE_ID } from '@angular/core';
import { RequestOptions, RequestOptionsArgs, RequestMethod, Headers } from '@angular/http';
import { TokenService } from 'app/services/token.service';
import { environment } from 'environments/environment';

@Injectable()
export class OauthRequestOptions extends RequestOptions {

  constructor (
    private tokenService: TokenService,
    @Inject(LOCALE_ID) private locale: string
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

      options.search['locale'] = this.locale.slice(0, 2);
      options.search['app'] = 'observations-tool';
    }

    return super.merge(options);
  }
}
