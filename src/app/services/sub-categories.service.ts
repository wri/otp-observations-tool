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

    getAllAnnexGovernances(): AnnexGovernance[] {
      return this.datastoreService.peekAll(AnnexGovernance);
    }

    getAnnexGovernancesByCountry(countryId: string): Promise<AnnexGovernance[]> {
      return this.datastoreService.query(AnnexGovernance, { country: countryId, page: { size: 10000 } }).toPromise();
    }

    getAllAnnexOperators(): AnnexOperator[] {
      return this.datastoreService.peekAll(AnnexOperator);
    }

    getAnnexOperatorsByCountry(countryId: string): Promise<AnnexOperator[]> {
      return this.datastoreService.query(AnnexOperator, { country: countryId, page: { size: 10000 } }).toPromise();
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
