import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { OperatorsService } from 'app/services/operators.service';
import { Operator } from 'app/models/operator.model';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-operator-list',
  templateUrl: './operator-list.component.html',
  styleUrls: ['./operator-list.component.scss']
})
export class OperatorListComponent extends TableFilterBehavior {

  constructor(
    protected service: OperatorsService,
    private router: Router
  ) {
    super();
  }

  triggerNewOperator(): void{
    this.router.navigate(['private/fields/operators/new']);
  }

  onEdit(row): void {

  }

  onDelete(operator: Operator): void {
    if (confirm(`Are you sure to delete the operator with name: ${operator.name}?`)) {
      this.service.deleteOperator(operator).then(
        data => {
          alert(data.json().messages[0].title);
          this.loadData();
        });
    }
  }

}
