import { Injectable, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import type { HttpEvent } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';


import { environment } from 'environments/environment';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { ApiCacheService } from 'app/services/offline/api-cache.service';
import { ConnectivityService, isNetworkError } from 'app/services/offline/connectivity.service';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  get locale() {
    return localStorage.getItem('lang') || 'en';
  }

  constructor (
    private tokenService: TokenService,
    private apiCache: ApiCacheService,
    private connectivity: ConnectivityService,
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
      const headers: Record<string, string> = {
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

      const cacheable = authReq.method === 'GET' && this.apiCache.isCacheable(authReq.urlWithParams);

      // Offline: don't even try the network, it can hang for a long time on a flaky connection
      if (cacheable && !this.connectivity.isOnline) {
        return this.fromCache(authReq, null);
      }

      return next.handle(authReq).pipe(
        tap((event) => {
          if (cacheable && event instanceof HttpResponse && event.ok) {
            // Cloned right away: the datastore rewrites the attributes of the body it receives
            this.apiCache.store(authReq.urlWithParams, JSON.parse(JSON.stringify(event.body)));
          }
        }),
        catchError((error) => {
          // The network, not the API: the device is offline or the server unreachable.
          // Reference data is then served from the cache when we have it.
          if (cacheable && isNetworkError(error)) {
            return this.fromCache(authReq, error);
          }
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

  /**
   * Answer a request from the cache, failing like a network error when nothing is cached
   * so the callers see the same error they would have seen without the cache.
   */
  private fromCache(req: HttpRequest<any>, networkError: HttpErrorResponse | null): Observable<HttpEvent<any>> {
    return from(this.apiCache.lookup(req.urlWithParams)).pipe(
      switchMap((body) => {
        if (body) {
          return of(new HttpResponse({ body, status: 200, statusText: 'OK (offline cache)', url: req.urlWithParams }));
        }
        return throwError(networkError || new HttpErrorResponse({ status: 0, statusText: 'Offline', url: req.urlWithParams }));
      })
    );
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
