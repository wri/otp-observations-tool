import { JsonApiService } from 'app/services/json-api.service';
import { User } from 'app/models/user.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UsersService extends JsonApiService<User> {

  public model = User;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: HttpClient
  ) {
    super();
  }

  public getAll(): Promise<User[]> {
    return this.datastoreService.findAll(User, { page: { size: 3000 } })
      .toPromise()
      .then((data) => data.getModels());
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
