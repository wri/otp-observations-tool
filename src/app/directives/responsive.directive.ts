import { Directive, OnInit, OnDestroy, TemplateRef, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { ResponsiveService } from 'app/services/responsive.service';
import { Subscription } from 'rxjs';

export const TABLET_BREAKPOINT = 768;

// Angular 10+ requires a base class that uses Angular features (DI, lifecycle hooks) to carry
// a decorator - NG2007. A selector-less @Directive() marks it as an abstract directive, which
// needs no NgModule declaration; the concrete subclasses below keep their own selectors.
@Directive()
export class ResponsiveDirective implements OnInit, OnDestroy {

  private subscription: Subscription;
  protected isVisible = true;
  protected firstCall = true;

  constructor (
    private responsiveService: ResponsiveService,
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscription = this.responsiveService.onResize
      .subscribe(windowWidth => this.updateComponent(windowWidth));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  hide() {
    this.isVisible = false;
    this.firstCall = false;
    this.viewContainerRef.clear();
    this.changeDetectorRef.markForCheck();
  }

  show() {
    this.isVisible = true;
    this.firstCall = false;
    this.viewContainerRef.createEmbeddedView(this.templateRef);
    this.changeDetectorRef.markForCheck();
  }

  updateComponent(windowWidth: number) {
  }

}

@Directive({
  selector: '[otpMaxTablet]'
})
export class MaxTabletDirective extends ResponsiveDirective {

  constructor (
    responsiveService: ResponsiveService,
    templateRef: TemplateRef<any>,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(responsiveService, templateRef, viewContainerRef, changeDetectorRef);
  }

  updateComponent(windowWidth: number) {
    if (windowWidth >= TABLET_BREAKPOINT && (this.isVisible || this.firstCall)) {
      this.hide();
    } else if (windowWidth < TABLET_BREAKPOINT && (!this.isVisible || this.firstCall)) {
      this.show();
    }
  }

}

@Directive({
  selector: '[otpMinTablet]'
})
export class MinTabletDirective extends ResponsiveDirective {

  constructor (
    responsiveService: ResponsiveService,
    templateRef: TemplateRef<any>,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(responsiveService, templateRef, viewContainerRef, changeDetectorRef);
  }

  updateComponent(windowWidth: number) {
    if (windowWidth < TABLET_BREAKPOINT && (this.isVisible || this.firstCall)) {
      this.hide();
    } else if (windowWidth >= TABLET_BREAKPOINT && (!this.isVisible || this.firstCall)) {
      this.show();
    }
  }

}
