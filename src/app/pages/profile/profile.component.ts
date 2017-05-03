import { UserDetailComponent } from 'app/pages/users/user-detail.component';
import { User } from './../../models/user.model';
import { UsersService } from 'app/services/users.service';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'otp-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @ViewChild('userDetail') userDetail: UserDetailComponent;

  constructor(
    private auth: AuthService,
    private userService: UsersService
  ) {

  }

  ngOnInit(): void {
    this.userService.getLoggedUser().then( (data) => {
      this.userDetail.user = data[0];
    });
  }


}
