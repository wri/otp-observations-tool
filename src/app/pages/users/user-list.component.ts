import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { Router } from '@angular/router';
import { User } from 'app/models/user.model';
import { UsersService } from 'app/services/users.service';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent extends TableFilterBehavior {

  columns = [
    { name: 'Name' },
    { name: 'Nickname' },
    { name: 'Email' }
  ];

  constructor(
    protected service: UsersService,
    private router: Router
  ) {
    super();
  }

  triggerNewUser(): void{
    this.router.navigate(['private/users/new']);
  }

  /**
   * Event handler to delete a user
   * @private
   * @param {User} user
   */
  onDelete(user: User): void {
    if(confirm(`Are you sure to delete the user with name: ${user.name}?`)) {
      this.service.deleteUser(user)
      .then(() => this.loadData())
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
