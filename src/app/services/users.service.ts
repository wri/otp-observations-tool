import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class UsersService {

    constructor(private datastoreService: DatastoreService) {

    }

    register(){
        //return this.datastoreService.query(Country).toPromise();
    }
}
