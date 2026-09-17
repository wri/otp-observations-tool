import { AuthService } from 'app/services/auth.service';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'otp-field-detail',
  templateUrl: './field-detail.component.html',
  styleUrls: ['./field-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class FieldDetailComponent {

  constructor(private auth: AuthService) {

  }

  public triggerLogout(): void {
    this.auth.logout();
  }


}
