import { TableFilterBehavior } from 'app/shared/table-filter/table-filter.behavior';
import { ObserversService } from './../../../services/observers.service';
import { Observer } from './../../../models/observer.model';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'otp-observer-list',
  templateUrl: './observer-list.component.html',
  styleUrls: ['./observer-list.component.scss']
})
export class ObserverListComponent extends TableFilterBehavior {

  constructor(
    protected service: ObserversService,
    private router: Router
  ) {
    super();
  }

  triggerNewObserver(): void {
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
      this.service.deleteObserver(observer)
      .then((data) => {
        this.loadData();
        alert(data.json().messages[0].title);
      })
      .catch((e) => alert('Unable to delete the observer: ${observer.name} '));
    }
  }

}
