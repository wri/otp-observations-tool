import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { DatastoreService } from 'app/services/datastore.service';
import { Observation } from 'app/models/observation.model';

@Injectable()
export class ObservationsService {

  constructor (
    private datastoreService: DatastoreService
  ) {}

  getAll(): Promise<Observation[]> {
    return this.datastoreService.query(Observation).toPromise();
  }
  getByType(type: String): Promise<Observation[]> {
    return this.datastoreService.query(Observation, {
      type: type,
      include: 'countries.name,governments'
    }).toPromise();
  }

}
