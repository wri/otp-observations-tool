
import {fromEvent as observableFromEvent,  ReplaySubject ,  Observable } from 'rxjs';

import {startWith, defaultIfEmpty, map, debounceTime} from 'rxjs/operators';
import { Injectable } from '@angular/core';





@Injectable()
export class ResponsiveService {

  private resize$: ReplaySubject<number> = new ReplaySubject(1);

  get onResize() {
    return this.resize$;
  }

  constructor() {
    observableFromEvent(window, 'resize').pipe(
      debounceTime(300),
      map(() => window.innerWidth),
      defaultIfEmpty(),
      startWith(window.innerWidth),)
      .subscribe(width => this.resize$.next(width));
  }

}
