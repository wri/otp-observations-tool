import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { AnnexOperator } from 'app/models/annex-operator.model';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AnnexOperatorsService } from 'app/services/annex-operators.service';

@Component({
  selector: 'otp-annex-operator-list',
  templateUrl: './annex-operator-list.component.html',
  styleUrls: ['./annex-operator-list.component.scss']
})
export class AnnexOperatorListComponent extends TableFilterBehavior {

  constructor(
    protected service: AnnexOperatorsService,
    private router: Router
  ) {
    super();
  }

  triggerNewAnnexOperator(): void {
    this.router.navigate(['private/fields/subcategories/operators/new']);
  }

  onEdit(row): void {

  }

  onDelete(annexOperator: AnnexOperator): void {
    if (confirm(`Are you sure to delete the AnnexOperator with name: ${annexOperator.illegality}?`)) {
      this.service.deleteAnnexOperator(annexOperator).then(
        data => {
          alert(data.json().messages[0].title);
          this.loadData();
        });
    }
  }


}
