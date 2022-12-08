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
  initialEmail = '';

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private translateService: TranslateService
  ) {
    this.loadUser();
  }

  get showCurrentPasswordField(): boolean {
    return this.initialEmail !== this.user.email || (this.user.password && this.user.password.length > 0);
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
        this.initialEmail = this.user.email;
      })
      .catch(err => console.error(err)) // TODO: visual feedback
      .then(() => this.loading = false);
  }

  onDiscard() {
    this.loadUser();
  }

  onSubmit(): void {
    this.saveLoading = true;

    // We can't send empty string to the server
    if (this.user.password === '') {
      this.user.password = null;
      this.user['password-confirmation'] = null;
    }
    // Temp Workaround to not send email to API if it was not changed
    // # TODO: change API to check if email changed instead
    if (this.user.email == this.initialEmail) {
      // @ts-ignore
      this.user[Object.getOwnPropertySymbols(this.user)[0]]['email'].hasDirtyAttributes = false;
    }

    this.user.save()
      .toPromise()
      .then(async () => {
        this.translateService.use(this.user.locale);
        alert(await this.translateService.get('profileUpdate.success').toPromise());

        // We reload to make sure the observations will be loaded in the correct language
        location.reload();
      })
      .catch(async (error) => {
        const messageArray = [
          await this.translateService.get('profileUpdate.error').toPromise()
        ];
        if (error && error.errors && error.errors.length) {
          for (let er of error.errors) {
            if (er.title === "is invalid" && er.source && er.source.pointer === '/data/attributes/current-password') {
              messageArray.push(await this.translateService.get('Current password is invalid').toPromise());
            } else {
              messageArray.push(`${er.title} - ${er.detail}`);
            }
          }
        }
        alert(messageArray.join('\n'));
      })
      .then(() => this.saveLoading = false);
  }

}
