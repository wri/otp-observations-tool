import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-observations',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.scss']
})
export class ObservationsComponent {

  newObservationText: string = 'New observation';

  constructor(
    private auth: AuthService,
    private router: Router
    ) {

  }

  public triggerNewObservation(): void {
    this.router.navigate(['observation/new']);
  }

  public triggerLogout(): void{
    this.auth.logout();
  }


}
