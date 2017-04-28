import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'otp-bottombar',
  templateUrl: './bottombar.component.html',
  styleUrls: ['./bottombar.component.scss']
})
export class BottombarComponent implements OnInit {

  admin: boolean = false;

  constructor() {

  }

  ngOnInit(): void {

  }


}
