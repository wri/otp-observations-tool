import { environment } from 'environments/environment.dev';
import { Operator } from 'app/models/operator.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class OperatorsService {

    constructor(
      private datastoreService: DatastoreService,
      private http: Http
      ) {

    }

    getAll(): Operator[] {
      return this.datastoreService.peekAll(Operator);
    }

    getByCountry(countryId): Promise<Operator[]> {
      return this.datastoreService.query(Operator, { countr_id: countryId, page: { size: 10000 }}).toPromise();
    }

    createOperator(formValues): Promise<any> {
      const payload = { operator: formValues };
      return this.http.post(`${environment.apiUrl}/operators`, payload)
        .map(response => response.json())
        .toPromise();
    }

    deleteOperator(operator: Operator): Promise<any> {
      return this.datastoreService.deleteRecord(Operator, operator.id).toPromise();
    }
}
