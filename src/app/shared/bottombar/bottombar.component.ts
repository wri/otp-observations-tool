import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'otp-bottombar',
  templateUrl: './bottombar.component.html',
  styleUrls: ['./bottombar.component.scss']
})
export class BottombarComponent implements OnInit {

  public admin: boolean = true;
  @Input() public activeButton: string;

  constructor(private router: Router) {
    this.activeButton = 'observations';
  }

  ngOnInit(): void {

  }

  onClick(buttonValue): void{
    this.activeButton = buttonValue;
    this.router.navigate([buttonValue]);
  }


}
