import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { Government } from './../../../models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-government-list',
  templateUrl: './government-list.component.html',
  styleUrls: ['./government-list.component.scss']
})
export class GovernmentListComponent extends TableFilterBehavior {

  constructor(
    protected service: GovernmentsService,
    private router: Router
  ) {
    super();
  }

  triggerNewGovernment(): void {
    this.router.navigate(['private/fields/governments/new']);
  }

  /**
   * Event handler to delete a government
   * @private
   * @param {Government} government
   */
  private onDelete(government: Government): void {
    if (confirm(`Are you sure to delete the government: ${government.government_entity}?`) ) {
      this.service.deleteGovernment(government)
      .then((data) => {
        this.loadData();
        alert(data.json().messages[0].title);
      })
      .catch((e) => alert('Unable to delete the government: ${government.government_entity} '));
    }
  }

  onEdit(row): void {

  }


}
