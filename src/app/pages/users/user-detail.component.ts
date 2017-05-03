import { Router } from '@angular/router';
import { User } from 'app/models/user.model';
import { UsersService } from 'app/services/users.service';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'otp-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {

  public user: User;
  @Input() public mode: string;
  @Input() public userId: string;

  constructor(
    private auth: AuthService,
    private userService: UsersService,
    private router: Router
    ) {
      this.mode = 'edit';
  }


  ngOnInit(): void {
    if (this.mode === 'edit') {
      this.userService.getUser(this.userId).then((data) => {
        this.user = data.length > 0 ? data[0] : null;
      });
    }
  }


}
