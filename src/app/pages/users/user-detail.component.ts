import { CountriesService } from 'app/services/countries.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'app/models/user.model';
import { UsersService } from 'app/services/users.service';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit, Input } from '@angular/core';
import { Country } from 'app/models/country.model';

@Component({
  selector: 'otp-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {

  loading = false;
  countries: Country[] = [];
  public user: User;
  public mode = 'new';
  @Input() public userId: number;

  constructor(
    private auth: AuthService,
    private userService: UsersService,
    private countriesService: CountriesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Update the mode of the component according to the URL
   */
  updateMode(): void {
    if (this.router.url.match(/\/edit\/[0-9]+$/)) {
      this.mode = 'edit';
    }
  }

  ngOnInit(): void {
    this.updateMode();

    this.countriesService.getAll()
      .then(data => this.countries = data);

    if (this.mode === 'edit') {
      this.userId = +this.route.snapshot.params['id'];

      this.userService.getUser(this.userId)
        .then(user => this.user = user);
    }
  }

  onSubmit(formValues) {
    if (!formValues.country_id) {
      delete formValues.country_id;
    }

    if (this.mode === 'edit') {
      this.userService.updateUser(this.user)
        .then(() => this.router.navigate(['/private/users']))
        .catch(() => alert('Unable to update the user'));
    } else {
      this.userService.createUser(formValues)
        .then(() => this.router.navigate(['/private/users']))
        .catch(() => alert('Unable to create the user'));
    }
  }


  onCancel() {
    this.router.navigate(['private/users']);
  }

}
