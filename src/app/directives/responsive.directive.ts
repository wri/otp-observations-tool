import { Directive, OnInit, OnDestroy, TemplateRef, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { ResponsiveService } from 'app/services/responsive.service';
import { Subscription } from 'rxjs/Subscription';

const TABLET_BREAKPOINT = 768;

class ResponsiveDirective implements OnInit, OnDestroy {

  private subscribtion: Subscription;
  protected isVisible = true;
  protected firstCall = true;

  constructor (
    private responsiveService: ResponsiveService,
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscribtion = this.responsiveService.onResize
      .subscribe(windowWidth => this.updateComponent(windowWidth));
  }

  ngOnDestroy() {
    this.subscribtion.unsubscribe();
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
