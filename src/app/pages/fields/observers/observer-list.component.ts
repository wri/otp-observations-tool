import { ObserversService } from './../../../services/observers.service';
import { Observer } from './../../../models/observer.model';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otp-observer-list',
  templateUrl: './observer-list.component.html',
  styleUrls: ['./observer-list.component.scss']
})
export class ObserverListComponent implements OnInit {

  private observers: Observer[];

  constructor(
    private observersService: ObserversService,
    private router: Router
  ) {
    this.observers = [];
  }

  ngOnInit(): void {
    this.observersService.getAll().then((data) => {
      this.observers = data;
    });
  }

  triggerNewObserver(): void{
    this.router.navigate(['private/fields/observers/new']);
  }

  onEdit(row): void{

  }

  /**
   * Event handler to delete a observer
   * @private
   * @param {Observer} observer
   */
  private onDelete(observer: Observer): void {
    if (confirm(`Are you sure to delete the observer: ${observer.name}?`) ) {
      this.observersService.deleteObserver(observer)
      .then((data) => {
        this.ngOnInit();
        alert(data.json().messages[0].title);
      })
      .catch((e) => alert('Unable to delete the observer: ${observer.name} '));
    }
  }

}
