import { SpeciesService } from 'app/services/species.service';
import { Species } from 'app/models/species.model';
import { Router } from '@angular/router';
import { LawsService } from 'app/services/laws.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss']
})
export class SpeciesListComponent implements OnInit {

  private species: Species[];

  constructor(
    private speciesService: SpeciesService,
    private router: Router
  ) {
    this.species = [];
  }

  ngOnInit(): void {
    this.speciesService.getAll().then((data) => {
      this.species = data;
    });
  }

  triggerNewSpecies(): void{
    this.router.navigate(['private/fields/species/new']);
  }


}
