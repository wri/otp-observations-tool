import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { NavigationComponent } from 'app/shared/navigation/navigation.component';
import { NavigationItemDirective } from 'app/shared/navigation/directives/item/item.directive';
import { MaxTabletDirective, MinTabletDirective } from 'app/directives/responsive.directive';
import { EmailValidatorDirective } from 'app/directives/email.directive';
import { EqualToValidatorDirective } from 'app/directives/equal-to.directive';
import { NumberValidatorDirective } from 'app/directives/number.directive';

/**
 * Small declarables needed by both the eager app shell and the lazy feature modules.
 * Anything imported here ends up in the initial bundle, so keep it light — heavier shared
 * UI (tables, filters, datepickers, modals) belongs in SharedUiModule instead.
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  declarations: [
    NavigationComponent,
    NavigationItemDirective,
    MaxTabletDirective,
    MinTabletDirective,
    EmailValidatorDirective,
    EqualToValidatorDirective,
    NumberValidatorDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    NavigationComponent,
    NavigationItemDirective,
    MaxTabletDirective,
    MinTabletDirective,
    EmailValidatorDirective,
    EqualToValidatorDirective,
    NumberValidatorDirective
  ]
})
export class SharedModule { }
