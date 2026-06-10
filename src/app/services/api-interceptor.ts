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

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.startsWith(environment.apiUrl)) {
      const headers: { [name: string]: string } = {
        'OTP-API-KEY': environment.OTP_API_KEY
      };
      const xsrfToken = this.getCookie('observations-tool_XSRF-TOKEN');
      if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
      }
      // if (this.tokenService.token) {
      //   headers['Authorization'] = `Bearer ${this.tokenService.token}`;
      // }
      const params = {
        app: 'observations-tool',
      };
      if (!(req.url.includes('locale=') || req.params.has('locale'))) {
        params['locale'] = this.locale;
      }
      const authReq = req.clone({
        setHeaders: headers,
        setParams: params,
        withCredentials: true
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
