import { AnnexOperator } from 'app/models/annex-operator.model';
import { AnnexGovernance } from 'app/models/annex-governance.model';
import { DatastoreService } from 'app/services/datastore.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Http } from '@angular/http';

@Injectable()
export class SubCategoriesService {

    constructor(private datastoreService: DatastoreService) {

    }

    getAllGovernances(){
        return this.datastoreService.query(AnnexGovernance).toPromise();
    }

    getAllOperators(){
        return this.datastoreService.query(AnnexOperator).toPromise();
    }
}
