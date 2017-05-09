import { ObserversService } from 'app/services/observers.service';
import { Router } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-observer-detail',
  templateUrl: './observer-detail.component.html',
  styleUrls: ['./observer-detail.component.scss']
})
export class ObserverDetailComponent implements OnInit {

  private countries: Country[] = [];
  private titleText: String = 'New Monitor';
  private loading: boolean;

  constructor(
    private countriesService: CountriesService,
    private observersService: ObserversService,
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
    this.router.navigate(['/private/fields/observers']);
  }

  onSubmit(formValues):void {
    this.loading = true;
    this.observersService.createObserver(formValues).then(
        data => {
          alert('Monitor created successfully!');
          this.loading = false;
          this.router.navigate(['/private/fields/observers']);
        }
      ).catch(error => {
        const errorMessage = error.json().errors[0].title;
        alert(errorMessage);
        this.loading = false;
      });
  }


}
