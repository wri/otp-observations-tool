import { Government } from './../../../models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-government-list',
  templateUrl: './government-list.component.html',
  styleUrls: ['./government-list.component.scss']
})
export class GovernmentListComponent implements OnInit {

  private governments: Government[];

  constructor(
    private router: Router,
    private governmentsService: GovernmentsService
  ) {
    this.governments = [];
  }

  ngOnInit(): void {
    this.governmentsService.getAll().then((data) => {
      this.governments = data;
    });
  }

  triggerNewGovernment(): void{
    this.router.navigate(['private/fields/governments/new']);
  }

  onDelete(row): void{

  }

  onEdit(row): void{

  }


}
