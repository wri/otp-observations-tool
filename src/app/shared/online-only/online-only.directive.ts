import { Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConnectivityService } from 'app/services/offline/connectivity.service';
import { OnlineOnlyNoticeComponent } from 'app/shared/online-only/online-only-notice.component';

/**
 * `*otpOnlineOnly`: renders its content when online, a "needs a connection" notice instead
 * when the page is opened offline, and swaps to the content once the connection is back.
 *
 * Content already rendered stays when the connection drops: tearing it down would discard
 * what the user was typing. Saving fails then, and the global banner says why.
 */
@Directive({
  selector: '[otpOnlineOnly]',
  standalone: false
})
export class OnlineOnlyDirective implements OnInit, OnDestroy {
  private showsContent = false;
  private subscription: Subscription = null;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private connectivity: ConnectivityService
  ) {}

  ngOnInit(): void {
    this.subscription = this.connectivity.onlineChanges.subscribe((online) => {
      if (online && !this.showsContent) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.showsContent = true;
      } else if (!online && !this.showsContent && !this.viewContainer.length) {
        this.viewContainer.createComponent(OnlineOnlyNoticeComponent);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
