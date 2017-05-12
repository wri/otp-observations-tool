import { SubCategoriesService } from 'app/services/sub-categories.service';
import { AnnexOperator } from 'app/models/annex-operator.model';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-annex-operator-list',
  templateUrl: './annex-operator-list.component.html',
  styleUrls: ['./annex-operator-list.component.scss']
})
export class AnnexOperatorListComponent implements OnInit {

  annexOperators: AnnexOperator[];

  constructor(
    private subCategoriesService: SubCategoriesService,
    private router: Router
  ) {
    this.annexOperators = [];
  }

  ngOnInit(): void {
    this.annexOperators = this.subCategoriesService.getAllAnnexOperators();
  }

  triggerNewAnnexOperator(): void{
    this.router.navigate(['private/fields/subcategories/operators/new']);
  }

  onEdit(row): void{

  }

  onDelete(annexOperator: AnnexOperator): void {
    if (confirm(`Are you sure to delete the AnnexOperator with name: ${annexOperator.illegality}?`)) {
      this.subCategoriesService.deleteAnnexOperator(annexOperator).then(
        data => {
          alert(data.json().messages[0].title);
          this.ngOnInit();
        });
    }
  }


}
