import { Directive, Input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- the selector deliberately mirrors Angular's own validator attributes
  selector: 'otp-navigation-item',
  standalone: false
})
export class NavigationItemDirective {

  @Input() name: string;
  @Input() url: string;
  @Input() exact = false;

}
