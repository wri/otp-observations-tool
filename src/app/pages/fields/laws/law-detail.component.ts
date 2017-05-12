import { Law } from 'app/models/law.model';
import { LawsService } from 'app/services/laws.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-law-detail',
  templateUrl: './law-detail.component.html',
  styleUrls: ['./law-detail.component.scss']
})
export class LawDetailComponent implements OnInit {

  law: Law;
  countries: Country[];
  titleText: string;
  submitButtonText: string;
  loading = false;
  public mode = 'new';
  lawId: number;

  constructor(
    private countriesService: CountriesService,
    private lawsService: LawsService,
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
      this.titleText = 'Edit law';
      this.submitButtonText = 'Update';
      this.lawId = +this.route.snapshot.params['id'];
    } else if (this.mode === 'new') {
      this.titleText = 'New law';
      this.submitButtonText = 'Create';
    }
  }

  ngOnInit(): void {
    this.countriesService.getAll().then(
      data => {
         this.countries = data;
      }
    );
  }

  onCancel(): void{
    this.router.navigate(['/private/fields/laws']);
  }

  onSubmit(formValues):void {

    this.loading = true;
    this.lawsService.createLaw(formValues).then(
        data => {
          alert('Law created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/laws']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }


}
