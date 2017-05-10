import { Router } from '@angular/router';
import { User } from 'app/models/user.model';
import { UsersService } from 'app/services/users.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  private users: User[] = [];

  private columns = [
    { name: 'Name' },
    { name: 'Nickname' },
    { name: 'Email' }
  ];

  constructor(
    private userService: UsersService,
    private router: Router
  ) {}

  private triggerNewUser(): void{
    this.router.navigate(['private/users/new']);
  }

  ngOnInit(): void {
    this.userService.getAll().then((data) => {
      this.users = data;
    });
  }

  /**
   * Event handler to delete a user
   * @private
   * @param {User} user
   */
  private onDelete(user: User): void {
    this.userService.deleteUser(user)
      .then(() => this.ngOnInit())
      .catch((e) => alert('Unable to delete the user'));
  }
}
