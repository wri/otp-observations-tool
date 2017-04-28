import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss']
})
export class FieldsComponent {

  constructor(private auth: AuthService) {

  }

  public triggerLogout(): void{
    this.auth.logout();
  }


}
