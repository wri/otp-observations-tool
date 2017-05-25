import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/startWith';

@Injectable()
export class ResponsiveService {

  private resize$: ReplaySubject<number> = new ReplaySubject(1);

  get onResize() {
    return this.resize$;
  }

  constructor() {
    Observable.fromEvent(window, 'resize')
      .debounceTime(300)
      .map(() => window.innerWidth)
      .defaultIfEmpty()
      .startWith(window.innerWidth)
      .subscribe(width => this.resize$.next(width));
  }

}
