import { AnnexGovernance } from 'app/models/annex-governance.model';
import { SubCategoriesService } from 'app/services/sub-categories.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-annex-governance-list',
  templateUrl: './annex-governance-list.component.html',
  styleUrls: ['./annex-governance-list.component.scss']
})
export class AnnexGovernanceListComponent implements OnInit {

  annexGovernances: AnnexGovernance[];

  constructor(
    private subCategoriesService: SubCategoriesService,
    private router: Router
  ) {
    this.annexGovernances = [];
  }

  ngOnInit(): void {
    this.subCategoriesService.getAllGovernances().then((data) => {
      this.annexGovernances = data;
    });
  }

  triggerNewAnnexGovernance(): void {
    this.router.navigate(['private/fields/subcategories/governance/new']);
  }

  onEdit(row): void {

  }

  onDelete(annexGovernance: AnnexGovernance): void {
    if (confirm(`Are you sure to delete the AnnexGovernance with name: ${annexGovernance.governance_pillar}?`)) {
      this.subCategoriesService.deleteAnnexGovernance(annexGovernance).then(
        data => {
          alert(data.json().messages[0].title);
          this.ngOnInit();
        });
    }
  }


}
