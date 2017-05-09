import { Router } from '@angular/router';
import { User } from 'app/models/user.model';
import { UsersService } from 'app/services/users.service';
import { AuthService } from 'app/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

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
      this.users = [];
  }

  private triggerLogout(): void{
    this.auth.logout();
  }

  private triggerNewUser(): void{
    this.router.navigate(['private/users/new']);
  }



  ngOnInit(): void {
    this.userService.getAll().then((data) => {
      this.users = data;
    });
  }


}
