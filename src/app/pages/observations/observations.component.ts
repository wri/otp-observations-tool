import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-observations',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.scss']
})
export class ObservationsComponent {

  newObservationText: string = 'New observation';

  constructor(private auth: AuthService) {

  }

  public triggerNewObservation(): void {
    console.log('new observation!');
  }

  public triggerLogout(): void{
    this.auth.logout();
  }


}
