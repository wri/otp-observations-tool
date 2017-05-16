import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/startWith';

@Injectable()
export class ResponsiveService {

  private resize$: Observable<number>;

  get onResize() {
    return this.resize$;
  }

  constructor() {
    this.resize$ = Observable.fromEvent(window, 'resize')
      .debounceTime(300)
      .defaultIfEmpty()
      .startWith(window.innerWidth)
      .map(() => window.innerWidth);
  }

}
