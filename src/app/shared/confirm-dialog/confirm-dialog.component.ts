import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, Injector, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Confirmation, ConfirmDialogService } from './confirm-dialog.service';

/** Renders ConfirmDialogService's question in a native <dialog>; placed once in the app shell */
@Component({
  selector: 'otp-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ConfirmDialogComponent implements OnDestroy {
  @ViewChild('dialog', { static: true }) dialog: ElementRef<HTMLDialogElement>;

  confirmation: Confirmation = null;

  private subscription: Subscription;

  constructor(service: ConfirmDialogService, private injector: Injector) {
    this.subscription = service.confirmation$.subscribe((c) => {
      this.confirmation = c;
      const dialog = this.dialog?.nativeElement;
      if (!dialog) return;
      if (!c && dialog.open) dialog.close();
      // Once the buttons are rendered, so showModal() focuses the one marked autofocus
      if (c) afterNextRender(() => !dialog.open && dialog.showModal(), { injector: this.injector });
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  answer(accepted: boolean): void {
    this.confirmation?.resolve(accepted);
  }

  /** Esc or any other way of closing the dialog without a button counts as cancelling */
  onClose(): void {
    this.answer(false);
  }
}
