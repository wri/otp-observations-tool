import { AnnexGovernance } from 'app/models/annex-governance.model';
import { environment } from 'environments/environment.dev';
import { Http } from '@angular/http';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { JsonApiService } from 'app/services/json-api.service';

@Injectable()
export class AnnexGovernanceService extends JsonApiService<AnnexGovernance> {

  public model = AnnexGovernance;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  getAll() {
    return this.datastoreService.query(AnnexGovernance, { page: { size: 100 }}).toPromise();
  }

  createAnnexGovernance(formValues): Promise<any> {
    const payload = { annex_governance: formValues };
    return this.http.post(`${environment.apiUrl}/annex_governances`, payload)
      .map(response => response.json())
      .toPromise();
  }

  getAnnexGovernancesByCountry(countryId: string): Promise<AnnexGovernance[]> {
    return this.datastoreService.query(AnnexGovernance, { country: countryId, page: { size: 10000 } }).toPromise();
  }

  deleteAnnexGovernance(annexGovernance: AnnexGovernance): Promise<any> {
    return this.datastoreService.deleteRecord(AnnexGovernance, annexGovernance.id).toPromise();
  }
}
