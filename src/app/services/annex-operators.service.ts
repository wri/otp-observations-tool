import { AnnexOperator } from 'app/models/annex-operator.model';
import { environment } from 'environments/environment.dev';
import { Http } from '@angular/http';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { JsonApiService } from 'app/services/json-api.service';

@Injectable()
export class AnnexOperatorsService extends JsonApiService<AnnexOperator> {

  public model = AnnexOperator;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  getAll() {
    return this.datastoreService.query(AnnexOperator, { page: { size: 100 }}).toPromise();
  }

  createAnnexOperator(formValues): Promise<any> {
    const payload = { annex_operator: formValues };
    return this.http.post(`${environment.apiUrl}/annex_operators`, payload)
      .map(response => response.json())
      .toPromise();
  }

  getAnnexOperatorsByCountry(countryId: string): Promise<AnnexOperator[]> {
    return this.datastoreService.query(AnnexOperator, { country: countryId, page: { size: 10000 } }).toPromise();
  }

  deleteAnnexOperator(annexOperator: AnnexOperator): Promise<any>{
    return this.datastoreService.deleteRecord(AnnexOperator, annexOperator.id).toPromise();
  }
}
