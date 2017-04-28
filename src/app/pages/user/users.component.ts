import { Router } from '@angular/router';
import { User } from 'app/models/user.model';
import { UsersService } from 'app/services/users.service';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  private users: User[];

  private columns = [
    { name: 'Name' },
    { name: 'Nickname' },
    { name: 'Email' }
  ];

  constructor(
    private auth: AuthService,
    private userService: UsersService,
    private router: Router
    ) {

  }

  private triggerLogout(): void{
    this.auth.logout();
  }

  private triggerNewUser(): void{
    this.router.navigate(['user/new']);
  }



  ngOnInit(): void {
    this.userService.getAll().then((data) => {
      this.users = data;
    });
  }


}
