import { Component } from '@angular/core';

@Component({
  selector: 'otp-organization-profile',
  templateUrl: './organization-profile.component.html',
  styleUrls: ['./organization-profile.component.scss']
})
export class OrganizationProfileComponent {

  loading = false;
  showMore = false; // Are we showing all the details?

  onSubmit(formValues, event): void {
    event.preventDefault();
  }

  onCancel(): void {

  }

}
