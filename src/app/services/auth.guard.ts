import { AuthService } from 'app/services/auth.service';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Promise<boolean> {
    return this.authService.checkLogged()
      .catch(isLogged => {
        this.router.navigate(['/']);
        return isLogged;
      });
  }

}
