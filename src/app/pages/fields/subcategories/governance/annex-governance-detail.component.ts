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
  private titleText: String = 'New Annex Governance';

  constructor(
    private countriesService: CountriesService,
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

  onCancel(): void{
    this.router.navigate(['/private/fields/subcategories/governance']);
  }

  onSubmit(formValues):void {
    console.log('submit!', formValues);
  }


}
