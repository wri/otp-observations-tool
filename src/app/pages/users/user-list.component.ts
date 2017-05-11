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

  users: User[] = [];

  columns = [
    { name: 'Name' },
    { name: 'Nickname' },
    { name: 'Email' }
  ];

  constructor(
    private userService: UsersService,
    private router: Router
  ) {}

  triggerNewUser(): void{
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
  onDelete(user: User): void {
    if(confirm(`Are you sure to delete the user with name: ${user.name}?`)) {
      this.userService.deleteUser(user)
      .then(() => this.ngOnInit())
      .catch((e) => alert('Unable to delete the user'));
    }
  }
  /**
   * Event handler to edit a user
   * @private
   * @param {User} user
   */
  onEdit(user: User): void {
    this.router.navigate([`private/users/edit/${user.id}`]);
  }
}
