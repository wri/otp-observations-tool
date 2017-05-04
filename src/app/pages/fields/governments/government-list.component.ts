import { AuthService } from 'app/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-government-list',
  templateUrl: './government-list.component.html',
  styleUrls: ['./government-list.component.scss']
})
export class GovernmentListComponent implements OnInit {


  constructor(
    private auth: AuthService
  ) {
  }

  ngOnInit(): void {
  }


}
