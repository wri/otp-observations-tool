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

  private annexOperators: AnnexOperator[];

  constructor(
    private subCategoriesService: SubCategoriesService,
    private router: Router
  ) {
    this.annexOperators = [];
  }

  ngOnInit(): void {
    this.subCategoriesService.getAllOperators().then((data) => {
      this.annexOperators = data;
    });
  }

  triggerNewAnnexOperator(): void{
    this.router.navigate(['private/fields/subcategories/operators/new']);
  }

  onEdit(row): void{

  }

  onDelete(row): void{

  }


}
