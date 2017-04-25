import { Router, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Injectable()
export class CheckLoginGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {

    }

    canActivate() {
        return this.authService.checkLogged().catch((err) => {
            this.router.navigate(['/login']);
        });
    }

}
