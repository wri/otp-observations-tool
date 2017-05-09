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

  private laws: Law[];

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


}
