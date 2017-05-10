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

  onEdit(row): void{

  }

   /**
   * Event handler to delete a species
   * @private
   * @param {Species} species
   */
  private onDelete(species: Species): void {
    if (confirm(`Are you sure to delete the species: ${species.name}?`) ) {
      this.speciesService.deleteSpecies(species)
      .then((data) => {
        this.ngOnInit();
        alert(data.json().messages[0].title);
      })
      .catch((e) => alert('Unable to delete the species: ${species.name} '));
    }
  }

}
