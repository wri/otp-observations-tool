import { NavigationItem } from 'app/shared/navigation/navigation.component';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ObservationsService } from 'app/services/observations.service';
import { Observation } from 'app/models/observation.model';
import { Tab } from 'app/shared/tabs/tabs.component';

@Component({
  selector: 'otp-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.scss']
})
export class ObservationListComponent implements OnInit {

  observations: Observation[] = [];
  private navigationItems: NavigationItem[] = [
      { name: 'For Operators', url: '/private/observations/operators' },
      { name: 'For Governance', url: '/private/observations/governance' }
    ];

  private get rows () {
    return this.observations.map(observation => ({
      date: observation.publication_date,
      details: observation.details
    }));
  }

  constructor(
    private router: Router,
    private observationsService: ObservationsService
  ) {}

  ngOnInit(): void {
    console.log('params', this.router.url);
    this.observationsService.getObservations()
      .then(observations => this.observations = observations);
  }
}
