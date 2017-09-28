import { JsonApiService } from 'app/services/json-api.service';
import { User } from 'app/models/user.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http, RequestOptionsArgs, Headers } from '@angular/http';

@Injectable()
export class UsersService extends JsonApiService<User> {

  public model = User;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  public getAll(): Promise<User[]> {
    return this.datastoreService.query(User, { page: { size: 3000 } })
      .toPromise();
  }

  /**
   * Get a user by their ID
   * @param {string} id - ID of the user
   * @param {*} [params={}] Additional params for the request
   * @returns {Promise<User>}
   */
  public getById(id: string, params: any = {}): Promise<User> {
    return this.datastoreService.findRecord(User, id, params)
      .toPromise();
  }
}
