import { AuthService } from 'app/services/auth.service';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isLogged = await this.authService.isUserLogged();

    if (!isLogged) {
      this.router.navigate(['/']);
    }

    return isLogged;
  }

}
