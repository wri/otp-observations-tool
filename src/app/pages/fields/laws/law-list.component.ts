import { Router } from '@angular/router';
import { LawsService } from './../../../services/laws.service';
import { Law } from 'app/models/law.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-law-list',
  templateUrl: './law-list.component.html',
  styleUrls: ['./law-list.component.scss']
})
export class LawListComponent implements OnInit {

  laws: Law[];

  constructor(
    private lawsService: LawsService,
    private router: Router
  ) {
    this.laws = [];
  }

  ngOnInit(): void {
    this.lawsService.getAll().then((data) => {
      this.laws = data;
    });
  }

  triggerNewLaw(): void{
    this.router.navigate(['private/fields/laws/new']);
  }

  onEdit(row): void{

  }

  /**
   * Event handler to delete a law
   * @private
   * @param {Law} law
   */
  private onDelete(law: Law): void {
    if(confirm(`Are you sure to delete the law: ${law.legal_reference}?`)) {
      this.lawsService.deleteLaw(law)
      .then(() => this.ngOnInit())
      .catch((e) => alert('Unable to delete the law: ${law.legal_reference} '));
    }
  }

}
