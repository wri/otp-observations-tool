import { AnnexOperatorsService } from 'app/services/annex-operators.service';
import { Law } from 'app/models/law.model';
import { LawsService } from 'app/services/laws.service';
import { Router } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-annex-operator-detail',
  templateUrl: './annex-operator-detail.component.html',
  styleUrls: ['./annex-operator-detail.component.scss']
})
export class AnnexOperatorDetailComponent implements OnInit {

  countries: Country[] = [];
  laws: Law[] = [];
  titleText: String = 'New Annex Operator';
  loading = false;

  constructor(
    private countriesService: CountriesService,
    private lawsService: LawsService,
    private annexOperatorsService: AnnexOperatorsService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );
    this.lawsService.getAll().then(
      data => {
         this.laws = data;
      }
    );
  }

  onCancel(): void{
    this.router.navigate(['/private/fields/subcategories/operators']);
  }

  onSubmit(formValues): void {
    this.loading = true;
    this.annexOperatorsService.createAnnexOperator(formValues).then(
        data => {
          alert('AnnexOperator created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/subcategories/operators']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }


}
