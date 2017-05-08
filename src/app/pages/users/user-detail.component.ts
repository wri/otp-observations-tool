import { CountriesService } from 'app/services/countries.service';
import { Router } from '@angular/router';
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

  private titleText: String = 'New User';

  private countries: Country[] = [];
  public user: User;
  @Input() public mode = 'new';
  @Input() public userId: string;

  constructor(
    private auth: AuthService,
    private userService: UsersService,
    private countriesService: CountriesService,
    private router: Router
  ) {}


  ngOnInit(): void {
    if (this.mode === 'edit') {
      this.userService.getUser(this.userId).then((data) => {
        this.user = data.length > 0 ? data[0] : null;
      });
    } else {
      this.countriesService.getAll().then(data => { this.countries = data; });
    }
  }

  onSubmit(formValues) {
    if (!formValues.country_id) {
      delete formValues.country_id;
    }

    this.userService.createUser(formValues)
      .then(() => this.router.navigate(['/private/users']))
      .catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
      });
  }

}
