import { AnnexGovernanceService } from 'app/services/annex-governance.service';
import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { AnnexGovernance } from 'app/models/annex-governance.model';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-annex-governance-list',
  templateUrl: './annex-governance-list.component.html',
  styleUrls: ['./annex-governance-list.component.scss']
})
export class AnnexGovernanceListComponent extends TableFilterBehavior {

  constructor(
    protected service: AnnexGovernanceService,
    private router: Router
  ) {
    super();
  }

  triggerNewAnnexGovernance(): void {
    this.router.navigate(['private/fields/subcategories/governance/new']);
  }

  onEdit(row): void {

  }

  onDelete(annexGovernance: AnnexGovernance): void {
    if (confirm(`Are you sure to delete the AnnexGovernance with name: ${annexGovernance.governance_pillar}?`)) {
      this.service.deleteAnnexGovernance(annexGovernance).then(
        data => {
          alert(data.json().messages[0].title);
          this.loadData();
        });
    }
  }


}
