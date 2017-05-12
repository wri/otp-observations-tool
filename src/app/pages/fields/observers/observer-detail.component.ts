import { Observer } from 'app/models/observer.model';
import { ObserversService } from 'app/services/observers.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Country } from 'app/models/country.model';
import { CountriesService } from 'app/services/countries.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'otp-observer-detail',
  templateUrl: './observer-detail.component.html',
  styleUrls: ['./observer-detail.component.scss']
})
export class ObserverDetailComponent implements OnInit {

  public observer: Observer;
  public countries: Country[] = [];
  titleText: string;
  submitButtonText: string;
  loading: boolean;
  public mode = 'new';
  @Input() public observerId: number;

  constructor(
    private countriesService: CountriesService,
    private observersService: ObserversService,
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
      this.titleText = 'Edit monitor';
      this.submitButtonText = 'Update';
      this.observerId = +this.route.snapshot.params['id'];
    } else if (this.mode === 'new') {
      this.titleText = 'New monitor';
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
      this.loadObserver();
    }
  }

  onCancel(): void {
    this.router.navigate(['/private/fields/observers']);
  }

  onSubmit(formValues): void {
    this.loading = true;
    if (this.mode === 'new') {
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
    } else {
      this.observersService.updateObserver(this.observer).then(
        data => {
          alert('Monitor updated successfully!');
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

  loadObserver(): void {
    this.loading = true;
    this.observersService.getById(this.observerId).then(
      data => {
        this.observer = data;
        this.loading = false;
      }
    ).catch( error => alert(error));
  }


}
