import { Observer } from 'app/models/observer.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class ObserversService {

    constructor(private datastoreService: DatastoreService) {

    }

    getAll(){
        return this.datastoreService.query(Observer).toPromise();
    }
}
