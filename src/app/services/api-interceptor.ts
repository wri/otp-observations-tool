import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';


import { environment } from 'environments/environment';
import { TokenService } from './token.service';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  get locale() {
    return localStorage.getItem('lang') || 'en';
  }

  constructor (
    private tokenService: TokenService
  ) {
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.startsWith(environment.apiUrl)) {
      const headers = {
        'OTP-API-KEY': environment.OTP_API_KEY
      };
      if (this.tokenService.token) {
        headers['Authorization'] = `Bearer ${this.tokenService.token}`;
      }
      const params = {
        app: 'observations-tool',
      };
      if (!req.params.has('locale')) {
        params['locale'] = this.locale;
      }
      const authReq = req.clone({
        setHeaders: headers,
        setParams: params
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}

export const apiInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: APIInterceptor,
  multi: true
}
