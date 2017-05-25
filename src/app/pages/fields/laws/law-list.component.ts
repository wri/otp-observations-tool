import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { Router } from '@angular/router';
import { LawsService } from './../../../services/laws.service';
import { Law } from 'app/models/law.model';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-law-list',
  templateUrl: './law-list.component.html',
  styleUrls: ['./law-list.component.scss']
})
export class LawListComponent extends TableFilterBehavior {

  constructor(
    protected service: LawsService,
    private router: Router
  ) {
    super();
  }

  triggerNewLaw(): void {
    this.router.navigate(['private/fields/laws/new']);
  }

  onEdit(row): void {

  }

  /**
   * Event handler to delete a law
   * @private
   * @param {Law} law
   */
  private onDelete(law: Law): void {
    if(confirm(`Are you sure to delete the law: ${law.legal_reference}?`)) {
      this.service.deleteLaw(law)
      .then(() => this.loadData())
      .catch((e) => alert('Unable to delete the law: ${law.legal_reference} '));
    }
  }

}
