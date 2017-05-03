import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-field-detail',
  templateUrl: './field-detail.component.html',
  styleUrls: ['./field-detail.component.scss']
})
export class FieldDetailComponent {

  constructor(private auth: AuthService) {

  }

  public triggerLogout(): void{
    this.auth.logout();
  }


}
