import { environment } from 'environments/environment.dev';
import { Http } from '@angular/http';
import { Law } from 'app/models/law.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { JsonApiService } from 'app/services/json-api.service';

@Injectable()
export class LawsService extends JsonApiService<Law> {

  public model = Law;

  constructor(
    protected datastoreService: DatastoreService,
    protected http: Http
  ) {
    super();
  }

  getAll() {
    return this.datastoreService.query(Law, { page: { size: 100 }}).toPromise();
  }

  createLaw(formValues): Promise<any> {
    const payload = { law: formValues };
    return this.http.post(`${environment.apiUrl}/laws`, payload)
      .map(response => response.json())
      .toPromise();
  }

  deleteLaw(law:Law): Promise<any>{
    return this.datastoreService.deleteRecord(Law, law.id)
      .toPromise();
  }
}
