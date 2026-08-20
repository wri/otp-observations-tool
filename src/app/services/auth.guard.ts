import { AuthService } from 'app/services/auth.service';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';

// Also used as a CanLoad guard so the lazy feature chunks are not downloaded before we know the
// visitor is logged in (the router resolves loadChildren while matching the URL, ahead of
// canActivate). The check takes no route arguments, so the same method serves both.
@Injectable()
export class AuthGuard  {

  /**
   * The session check in flight for the current navigation, if any.
   *
   * Reaching a lazy area under /private runs this guard twice in a row: canLoad while the
   * router matches the URL, then canActivate on the parent once the route tree is built.
   * Each call hits /users/current-user and, through it, /observers/:id — so a single
   * navigation asked the API the same two questions twice. Both guards still run; they
   * just share one answer for as long as the navigation lasts.
   */
  private sessionCheck: Promise<boolean> = null;

  constructor (
    private authService: AuthService,
    private router: Router
  ) {
    // Deliberately scoped to one navigation rather than cached with a TTL: the guards exist
    // to notice a session that died between navigations, and that has to keep working.
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd
        || event instanceof NavigationCancel
        || event instanceof NavigationError))
      .subscribe(() => this.sessionCheck = null);
  }

  async canActivate(): Promise<boolean> {
    if (!this.sessionCheck) {
      this.sessionCheck = this.authService.isUserLogged();
    }

    const isLogged = await this.sessionCheck;

    if (!isLogged) {
      this.router.navigate(['/'], {
        queryParams: { returnUrl: location.pathname }
      });
    }

    return isLogged;
  }

  canLoad(): Promise<boolean> {
    return this.canActivate();
  }

}
