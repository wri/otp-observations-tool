import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { SpeciesService } from 'app/services/species.service';
import { Species } from 'app/models/species.model';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss']
})
export class SpeciesListComponent extends TableFilterBehavior {

  constructor(
    protected service: SpeciesService,
    private router: Router
  ) {
    super();
  }

  triggerNewSpecies(): void {
    this.router.navigate(['private/fields/species/new']);
  }

  onEdit(row): void {

  }

   /**
   * Event handler to delete a species
   * @private
   * @param {Species} species
   */
  private onDelete(species: Species): void {
    if (confirm(`Are you sure to delete the species: ${species.name}?`) ) {
      this.service.deleteSpecies(species)
      .then((data) => {
        this.loadData();
        alert(data.json().messages[0].title);
      })
      .catch((e) => alert('Unable to delete the species: ${species.name} '));
    }
  }

}
