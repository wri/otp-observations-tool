import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


import { environment } from 'environments/environment';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  get locale() {
    return localStorage.getItem('lang') || 'en';
  }

  constructor (
    private tokenService: TokenService,
    private injector: Injector
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
      return next.handle(authReq).pipe(
        catchError((error) => {
          // A 401 means the session cookie is missing/expired. Drop the local
          // auth state and send the user back to login. Skip the auth-flow
          // endpoints (login/logout and the current-user probe) whose 401s are
          // expected and handled by AuthService, otherwise the login route's
          // guard would re-probe and loop redirects.
          if (error instanceof HttpErrorResponse && error.status === 401 && !this.isAuthRequest(req.url)) {
            this.injector.get(AuthService).sessionExpired();
          }
          return throwError(error);
        })
      );
    }

    return next.handle(req);
  }

  private isAuthRequest(url: string): boolean {
    return url.endsWith('/login')
      || url.endsWith('/logout')
      || url.includes('/current-user');
  }
}

export const apiInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: APIInterceptor,
  multi: true
}
