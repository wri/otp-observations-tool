import { AnnexGovernance } from 'app/models/annex-governance.model';
import { SubCategoriesService } from 'app/services/sub-categories.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-annex-governance-detail',
  templateUrl: './annex-governance-detail.component.html',
  styleUrls: ['./annex-governance-detail.component.scss']
})
export class AnnexGovernanceDetailComponent implements OnInit {

  private countries: Country[] = [];
  titleText: string;
  loading = false;
  submitButtonText: string;
  public mode = 'new';
  annexGovernanceId: string;
  annexGovernance: AnnexGovernance;

  constructor(
    private countriesService: CountriesService,
    private subCategoriesService: SubCategoriesService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    if (this.router.url.match(/\/edit\/[0-9]+$/)) {
      this.setMode('edit');
    } else {
      this.setMode('new');
    }

  }

  setMode(value: string): void {
    this.mode = value;
    if (this.mode === 'edit') {
      this.titleText = 'Edit AnnexGovernance';
      this.submitButtonText = 'Update';
      this.annexGovernanceId = this.route.snapshot.params['id'];
    } else if (this.mode === 'new') {
      this.titleText = 'New AnnexGovernance';
      this.submitButtonText = 'Create';
    }
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );
    if (this.mode === 'edit') {
      this.loadAnnexGovernance();
    }
  }

  loadAnnexGovernance(): void {
    this.loading = true;
    this.subCategoriesService.getAnnexGovernanceById(this.annexGovernanceId).then(
      data => {
        this.annexGovernance = data;
        this.loading = false;
      }
    ).catch( error => alert(error));
  }

  onCancel(): void {
    this.router.navigate(['/private/fields/subcategories/governance']);
  }

  onSubmit(formValues): void {
    this.loading = true;
    if (this.mode === 'new') {
      this.subCategoriesService.createAnnexGovernance(formValues).then(
        data => {
          alert('AnnexGovernance created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/subcategories/governance']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
    } else {
      this.subCategoriesService.updateAnnexGovernance(this.annexGovernance).then(
        data => {
          alert('AnnexGovernance updated successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/subcategories/governance']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
    }
  }


}
