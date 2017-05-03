import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.scss']
})
export class FieldListComponent {

  constructor(private auth: AuthService) {

  }

  public triggerLogout(): void{
    this.auth.logout();
  }


}
