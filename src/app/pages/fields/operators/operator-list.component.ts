import { OperatorsService } from 'app/services/operators.service';
import { Operator } from 'app/models/operator.model';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-operator-list',
  templateUrl: './operator-list.component.html',
  styleUrls: ['./operator-list.component.scss']
})
export class OperatorListComponent implements OnInit {

  private operators: Operator[];

  constructor(
    private operatorsService: OperatorsService,
    private router: Router
  ) {
    this.operators = [];
  }

  ngOnInit(): void {
    this.operatorsService.getAll().then((data) => {
      this.operators = data;
    });
  }

  triggerNewOperator(): void{
    this.router.navigate(['private/fields/operators/new']);
  }

  onEdit(row): void{

  }

  onDelete(row): void{

  }

}
