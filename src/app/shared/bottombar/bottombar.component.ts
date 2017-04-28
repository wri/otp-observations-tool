import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'otp-bottombar',
  templateUrl: './bottombar.component.html',
  styleUrls: ['./bottombar.component.scss']
})
export class BottombarComponent implements OnInit {

  public admin: boolean = true;
  @Input() public activeButton: string;

  constructor() {
    this.activeButton = 'observations';
  }

  ngOnInit(): void {

  }

  onClick(buttonValue): void{
    this.activeButton = buttonValue;
  }


}
