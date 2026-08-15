import { AuthService } from 'app/services/auth.service';
import { CanActivate, CanLoad, Router } from '@angular/router';
import { Injectable } from '@angular/core';

// Also used as a CanLoad guard so the lazy feature chunks are not downloaded before we know the
// visitor is logged in (the router resolves loadChildren while matching the URL, ahead of
// canActivate). The check takes no route arguments, so the same method serves both.
@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isLogged = await this.authService.isUserLogged();

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
