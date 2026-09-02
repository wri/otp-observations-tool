import { Component, Input } from '@angular/core';

/**
 * Replaces the `<spinner>` from angular2-spinner, which was abandoned at 1.0.10 and ships only a
 * `main` field - no `typings`/`module`/`es2015` - so Angular 12's ngcc does not recognise it as an
 * entry point and leaves it as un-migrated View Engine code. Ivy then cannot consume SpinnerModule,
 * which surfaced as NG6002 on every module importing SharedUiModule.
 *
 * The markup below reproduces what that package rendered: a rotating ring drawn with borders,
 * the leading edge in `color` and the remainder in a translucent variant of it.
 */
@Component({
  selector: 'otp-loader',
  styleUrls: ['loader.component.scss'],
  template: `
    <span *ngIf="overlay === false" class="spinner"></span>
    <div *ngIf="overlay !== false" [ngClass]="{ overlay: true, '-fixed': fixed !== false }">
      <span class="spinner"></span>
    </div>
  `,
  standalone: false
})
export class LoaderComponent {

  // Whether we want to display an overlay
  @Input() overlay = false;
  // Whether the overlay should have a fixed position
  @Input() fixed = false;

}
