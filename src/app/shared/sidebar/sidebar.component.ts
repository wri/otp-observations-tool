import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'otp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  admin: boolean = false;

  constructor() {

  }

  ngOnInit(): void {

  }


}
