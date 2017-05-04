import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
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
  tabs: Tab[] = [
    { id: 'operators', name: 'Observations on operators' },
    { id: 'governance', name: 'Observations on governance' },
  ];

  private get rows () {
    return this.observations.map(observation => ({
      date: observation.publication_date,
      details: observation.details
    }));
  }

  constructor(
    private auth: AuthService,
    private router: Router,
    private observationsService: ObservationsService
  ) {}

  ngOnInit(): void {
    this.observationsService.getObservations()
      .then(observations => this.observations = observations);
  }
}
