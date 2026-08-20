import { AuthService } from 'app/services/auth.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class AlreadyLoggedGuard  {
  private returnUrl = '/private/observations';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isLogged = await this.authService.isUserLogged();

    if (isLogged) {
      this.router.navigate([this.returnUrl]);
    }

    return !isLogged;
  }

}
