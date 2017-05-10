import { AnnexOperator } from 'app/models/annex-operator.model';
import { AnnexGovernance } from 'app/models/annex-governance.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class SubCategoriesService {

    constructor(
      private datastoreService: DatastoreService,
      private http: Http
    ) {

    }

    getAllGovernances(){
      return this.datastoreService.query(AnnexGovernance).toPromise();
    }

    getAllOperators(){
      return this.datastoreService.query(AnnexOperator).toPromise();
    }

    deleteAnnexGovernance(annexGovernance: AnnexGovernance): Promise<any> {
      return this.datastoreService.deleteRecord(AnnexGovernance, annexGovernance.id).toPromise();
    }

    deleteAnnexOperator(annexOperator: AnnexOperator): Promise<any>{
      return this.datastoreService.deleteRecord(AnnexOperator, annexOperator.id).toPromise();
    }

    createAnnexGovernance(formValues): Promise<any> {
      const payload = { annex_governance: formValues };
      return this.http.post(`${environment.apiUrl}/annex_governances`, payload)
        .map(response => response.json())
        .toPromise();
    }

    createAnnexOperator(formValues): Promise<any> {
      const payload = { annex_operator: formValues };
      return this.http.post(`${environment.apiUrl}/annex_operators`, payload)
        .map(response => response.json())
        .toPromise();
    }

}
