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

    getAll(): Promise<Operator[]> {
      return this.datastoreService.query(Operator).toPromise();
    }

    getById(id): Promise<Operator> {
      return this.datastoreService.findRecord(Operator, id).toPromise();
    }

    getByCountry(countryId): Promise<Operator[]> {
      return this.datastoreService.query(Operator, { countr_id: countryId, page: { size: 10000 }}).toPromise();
    }

    updateOperator(operator: Operator): Promise<any> {
      const payload = {
        operator: {
          name: operator.name,
          operator_type: operator.operator_type,
          country_id: operator.country ? operator.country.id : '',
          concession: operator.concession,
          is_active: operator.is_active,
          details: operator.details
        }
      };
      debugger;
      return this.http.patch(`${environment.apiUrl}/operators/${operator.id}`, payload)
        .map(response => response.json())
        .toPromise();
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
