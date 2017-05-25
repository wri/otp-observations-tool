import { AnnexGovernanceService } from 'app/services/annex-governance.service';
import { Router } from '@angular/router';
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
  titleText: String = 'New Annex Governance';
  loading = false;

  constructor(
    private countriesService: CountriesService,
    private annexGovernanceService: AnnexGovernanceService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );
  }

  onCancel(): void {
    this.router.navigate(['/private/fields/subcategories/governance']);
  }

  onSubmit(formValues): void {
    this.loading = true;
    this.annexGovernanceService.createAnnexGovernance(formValues).then(
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
  }


}
