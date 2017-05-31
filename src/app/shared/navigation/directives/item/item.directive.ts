import { Directive, Input, ContentChild, TemplateRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'otp-navigation-item'
})
export class NavigationItemDirective {

  @Input() name: string;
  @Input() url: string;
  @Input() exact = false;

}
