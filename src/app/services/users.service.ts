import { User } from 'app/models/user.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class UsersService {

    constructor(
      private datastoreService: DatastoreService,
      private http: Http
    ) {

    }

    public getAll(): Promise<User[]>{
      return this.datastoreService.query(User).toPromise();
    }

    public getUser(id): Promise<User[]>{
      return this.datastoreService.query(User, id).toPromise();
    }

    public getLoggedUser(): Promise<User[]>{
      return this.http.get(`${environment.apiUrl}/users/current-user`)
        .map(response => response.json()).toPromise();
    }
}
