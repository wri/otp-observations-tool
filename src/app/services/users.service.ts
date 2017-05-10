import { User } from 'app/models/user.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http, RequestOptionsArgs, Headers } from '@angular/http';

@Injectable()
export class UsersService {

    constructor(
      private datastoreService: DatastoreService,
      private http: Http
    ) {}

    public getAll(): Promise<User[]> {
      return this.datastoreService
        .query(User, { page: { size: 10000 } })
        .toPromise();
    }

    public getUser(id): Promise<User> {
      return this.datastoreService.findRecord(User, id)
        .toPromise();
    }

    public getLoggedUser(): Promise<User[]> {
      return this.http.get(`${environment.apiUrl}/users/current-user`)
        .map(response => response.json()).toPromise();
    }

    public createUser(values: object): Promise<any> {
      const payload = { user: values };
      return this.http.post(`${environment.apiUrl}/register`, payload)
        .map(response => response.json())
        .toPromise();
    }

    public updateUser(user: User): Promise<any> {
      return this.http.patch(`${environment.apiUrl}/users/${user.id}`, {
        user: {
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          institution: user.institution,
          country_id: user.country.id,
          user_permission_attributes: user.user_permission_attributes
        }
      }).toPromise();
    }

    public deleteUser(user: User): Promise<any> {
      return this.datastoreService.deleteRecord(User, user.id)
        .toPromise();
    }
}
