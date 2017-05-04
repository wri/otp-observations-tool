import { Government } from 'app/models/government.model';
import { GovernmentsService } from 'app/services/governments.service';
import { AnnexGovernance } from 'app/models/annex-governance.model';
import { AnnexOperator } from 'app/models/annex-operator.model';
import { SubCategoriesService } from 'app/services/sub-categories.service';
import { Http } from '@angular/http';
import { CountriesService } from 'app/services/countries.service';
import { Country } from 'app/models/country.model';
import { Component, OnInit } from '@angular/core';
import { DatePickerOptions } from 'ng2-datepicker';

@Component({
  selector: 'otp-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss']
})
export class ObservationDetailComponent implements OnInit {

  private titleText: String = 'New observation';
  private model: any = {};
  private loading = false;
  private returnUrl: string;
  private countries: Country[];
  private governments: Government[];
  private subCategoriesOperators: AnnexOperator[];
  private subCategoriesGovernance: AnnexGovernance[];
  private subCategories: any;
  private dateOptions: DatePickerOptions;
  private type: String;
  private governanceSelected: boolean;

  constructor(
    private countriesService: CountriesService,
    private subCategoriesService: SubCategoriesService,
    private governmentService: GovernmentsService,
    private http: Http) {

      this.countries = new Array<Country>();
      this.dateOptions = new DatePickerOptions();
      this.type = 'operator';
      this.governanceSelected = false;
  }

  onTypeChange(event): void{
    this.type = event.target.value;
    this.governanceSelected = this.type === 'governance';

    if (this.type === 'operator') {
      this.subCategoriesService.getAllOperators().then(
        data => {
          this.subCategoriesOperators = data;
        }
      );
    } else if(this.type === 'governance') {
      this.subCategoriesService.getAllGovernances().then(
        data => {
          this.subCategoriesGovernance = data;
        }
      );
    }

    console.log(this.type);
  }

  ngOnInit(): void {
    this.countriesService.getCountries().then(
      data => {
         this.countries = data;
      }
    );
    this.subCategoriesService.getAllOperators().then(
      data => {
        this.subCategoriesOperators = data;
      }
    );
  }

}
