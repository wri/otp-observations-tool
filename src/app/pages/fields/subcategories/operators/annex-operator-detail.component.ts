import { AnnexOperator } from 'app/models/annex-operator.model';
import { SubCategoriesService } from 'app/services/sub-categories.service';
import { Law } from 'app/models/law.model';
import { LawsService } from 'app/services/laws.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'otp-annex-operator-detail',
  templateUrl: './annex-operator-detail.component.html',
  styleUrls: ['./annex-operator-detail.component.scss']
})
export class AnnexOperatorDetailComponent implements OnInit {

  @ViewChild('law_ids') lawSelectorRef;
  countries: Country[] = [];
  laws: Law[] = [];
  titleText: string;
  loading = false;
  submitButtonText: string;
  public mode = 'new';
  annexOperatorId: string;
  annexOperator: AnnexOperator;

  constructor(
    private countriesService: CountriesService,
    private lawsService: LawsService,
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
      this.titleText = 'Edit AnnexOperator';
      this.submitButtonText = 'Update';
      this.annexOperatorId = this.route.snapshot.params['id'];
    } else if (this.mode === 'new') {
      this.titleText = 'New AnnexOperator';
      this.submitButtonText = 'Create';
    }
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
    if (this.mode === 'edit') {
      this.loadAnnexOperator();
    }
  }

  loadAnnexOperator(): void {
    this.loading = true;
    this.subCategoriesService.getAnnexOperatorById(this.annexOperatorId).then(
      data => {
        this.annexOperator = data;
        setTimeout(() => this.updateLawSelector(), 1000);
      }
    ).catch( error => alert(error));
  }

  updateLawSelector(): void {
    const options = this.lawSelectorRef.nativeElement.options;
    for ( let i = 0; i < options.length ; i++) {
      const element = options[i];
      element.selected = this.annexOperator.laws.find( elem => {
         return elem.id === element.value;
      });
    }
    this.loading = false;
  }


  onCancel(): void{
    this.router.navigate(['/private/fields/subcategories/operators']);
  }

  onSubmit(formValues): void {
    this.loading = true;
    if (this.mode === 'new') {
      this.subCategoriesService.createAnnexOperator(formValues).then(
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
    } else {
      this.subCategoriesService.updateAnnexOperator(this.annexOperator).then(
        data => {
          alert('AnnexOperator updated successfully!');
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

  onLawSelectionChange(target): void {
    const selectedLaws = [];
    for ( let i = 0; i < target.selectedOptions.length ; i++ ) {
      selectedLaws.push(target.selectedOptions[i].value);
    }
    this.annexOperator.laws = selectedLaws;
  }
}
