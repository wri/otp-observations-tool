import { TranslateService } from '@ngx-translate/core';
import { User } from './../../models/user.model';
import { UsersService } from 'app/services/users.service';
import { AuthService } from 'app/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  user: User = null;
  loading = true;
  saveLoading = false;

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private translateService: TranslateService
  ) {
    this.loadUser();
  }

  /**
   * Load the user
   */
  loadUser() {
    this.usersService.getById(this.auth.userId, { include: 'country,observer' })
      .then((user) => {
        this.user = user;

        // We need to set them to empty string to avoid issues with
        // the equalTo validator
        this.user.password = '';
        this.user['password-confirmation'] = '';
      })
      .catch(err => console.error(err)) // TODO: visual feedback
      .then(() => this.loading = false);
  }

  onDiscard() {
    this.loadUser();
  }

  onSubmit(): void {
    this.saveLoading = true;

    // We can't send empty string to the server without
    // receiving an error
    if (!this.user.password.length) {
      this.user.password = null;
      this.user['password-confirmation'] = null;
    }

    // The value may be undefined
    this.user['public-info'] = !!this.user['public-info'];

    this.user.save()
      .toPromise()
      .then(async () => alert(await this.translateService.get('profileUpdate.success').toPromise()))
      .catch(async () => alert(await this.translateService.get('profileUpdate.success').toPromise()))
      .then(() => this.saveLoading = false);
  }

}
