import { AuthService } from 'app/services/auth.service';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class UserRoleGuard implements CanActivate {
  private returnUrl = '/private/observations';

  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean {
    const userRole = this.authService.userRole;
    const includeRoles = route.data['authIncludeRoles'];
    const excludeRoles = route.data['authExcludeRoles'];
    const redirectTo = route.data['redirectTo'] || this.returnUrl;
    let result = true;

    if (includeRoles && includeRoles.length && !includeRoles.includes(userRole)) {
      result = false;
    }
    if (excludeRoles && excludeRoles.length && excludeRoles.includes(userRole)) {
      result = false;
    }

    if (!result) {
      this.router.navigate([redirectTo]);
    }

    return result;
  }
}
