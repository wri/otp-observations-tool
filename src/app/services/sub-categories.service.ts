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

    // -------------- ANNEX GOVERNANCE -----------------------

    getAllAnnexGovernances(): Promise<AnnexGovernance[]> {
      return this.datastoreService.query(AnnexGovernance).toPromise();
    }

    getAnnexGovernancesByCountry(countryId: string): Promise<AnnexGovernance[]> {
      return this.datastoreService.query(AnnexGovernance, { country: countryId, page: { size: 10000 } }).toPromise();
    }

    getAnnexGovernanceById(annexGovernanceId: string): Promise<AnnexGovernance> {
      return this.datastoreService.findRecord(AnnexGovernance, annexGovernanceId).toPromise();
    }

    deleteAnnexGovernance(annexGovernance: AnnexGovernance): Promise<any> {
      return this.datastoreService.deleteRecord(AnnexGovernance, annexGovernance.id).toPromise();
    }

    updateAnnexGovernance(annexGovernance: AnnexGovernance): Promise<any> {
      const payload = {
        annex_governance: {
          governance_pillar: annexGovernance.governance_pillar,
          governance_problem: annexGovernance.governance_problem,
          details: annexGovernance.details,
          country_id: annexGovernance.country ? annexGovernance.country.id : ''
        }
      };

      return this.http.patch(`${environment.apiUrl}/annex_governances/${annexGovernance.id}`, payload)
        .map(response => response.json())
        .toPromise();
    }

    createAnnexGovernance(formValues): Promise<any> {
      const payload = { annex_governance: formValues };
      return this.http.post(`${environment.apiUrl}/annex_governances`, payload)
        .map(response => response.json())
        .toPromise();
    }

    // -------------- ANNEX OPERATOR -----------------------

    getAllAnnexOperators(): Promise<AnnexOperator[]> {
      return this.datastoreService.query(AnnexOperator).toPromise();
    }

    getAnnexOperatorsByCountry(countryId: string): Promise<AnnexOperator[]> {
      return this.datastoreService.query(AnnexOperator, { country: countryId, page: { size: 10000 } }).toPromise();
    }

    getAnnexOperatorById(annexOperatorId: string): Promise<AnnexOperator> {
      return this.datastoreService.findRecord(AnnexOperator, annexOperatorId).toPromise();
    }

    deleteAnnexOperator(annexOperator: AnnexOperator): Promise<any>{
      return this.datastoreService.deleteRecord(AnnexOperator, annexOperator.id).toPromise();
    }

    updateAnnexOperator(annexOperator: AnnexOperator): Promise<any> {
      const payload = {
        annex_operator: {
          illegality: annexOperator.illegality,
          country_id: annexOperator.country ? annexOperator.country.id : '',
          details: annexOperator.details,
          law_ids: annexOperator.laws ? annexOperator.laws : ''
        }
      };

      return this.http.patch(`${environment.apiUrl}/annex_operators/${annexOperator.id}`, payload)
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
