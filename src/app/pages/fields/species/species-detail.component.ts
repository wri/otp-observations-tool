import { Species } from 'app/models/species.model';
import { SpeciesService } from 'app/services/species.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-species-detail',
  templateUrl: './species-detail.component.html',
  styleUrls: ['./species-detail.component.scss']
})
export class SpeciesDetailComponent implements OnInit {

  countries: Country[];
  countriesDropdownSettings: any;
  countriesDropdownData: any;
  titleText: string;
  submitButtonText: string;
  loading = false;
  public mode = 'new';
  speciesId: string;
  species: Species;

  constructor(
    private countriesService: CountriesService,
    private speciesService: SpeciesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.countriesDropdownSettings = {
      text: 'Please select a set of countries',
      enableSearchFilter: true
    };
    this.countriesDropdownData = [];

    if (this.router.url.match(/\/edit\/[0-9]+$/)) {
      this.setMode('edit');
    } else {
      this.setMode('new');
    }
  }

  setMode(value: string): void {
    this.mode = value;
    if (this.mode === 'edit') {
      this.titleText = 'Edit species';
      this.submitButtonText = 'Update';
      this.speciesId = this.route.snapshot.params['id'];
    } else if (this.mode === 'new') {
      this.titleText = 'New species';
      this.submitButtonText = 'Create';
    }
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
         this.countries.forEach((value) => {
          this.countriesDropdownData.push({ id: value.id, itenName: value.name });
         });
      }
    );
    if (this.mode === 'edit') {
      this.loadSpecies();
    }
  }

  loadSpecies(): void {
    this.loading = true;
    this.speciesService.getById(this.speciesId).then(
      data => {
        this.species = data;
        this.loading = false;
      }
    ).catch( error => alert(error));
  }

  onCancel(): void {
    this.router.navigate(['/private/fields/species']);
  }

  onSubmit(formValues):void {
    this.loading = true;
    if (this.mode === 'new') {
      this.speciesService.createSpecies(formValues).then(
        data => {
          alert('Species created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/species']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
    } else {
      this.speciesService.updateSpecies(this.species).then(
        data => {
          alert('Species updated successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/species']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
    }

  }

}
