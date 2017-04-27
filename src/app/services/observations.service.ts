import { Http } from '@angular/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

// interface Observation {

// }

@Injectable()
class ObservationsService implements OnInit {

  observations: object[];

  constructor(
    private http: Http
  ) {}

  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/observations`)
      .map(response => response.json())
      .toPromise();
  }

}
