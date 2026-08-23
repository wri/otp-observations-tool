import { AuthService } from 'app/services/auth.service';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class PageNotFoundComponent implements OnInit {

  isLogged = false;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    // We call this method to trigger a check on whether the user is logged in
    // or not in order to have the app component update consecutively
    this.isLogged = await this.authService.isUserLogged();
  }


}
