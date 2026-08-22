import { Component, Input, Output, EventEmitter, ContentChild, ElementRef, OnInit } from '@angular/core';
import * as A11yDialog from 'a11y-dialog';

@Component({
  selector: 'otp-modal',
  templateUrl: 'modal.component.html',
  styleUrls: ['modal.component.scss'],
  standalone: false
})

export class ModalComponent implements OnInit {

  dialog: any;
  private _opened = false;

  @Input() title: string;
  @Input() closeable = true;

  @Input()
  set opened(opened: boolean) {
    this._opened = opened;
    if (this.dialog) {
      this.dialog[opened ? 'show' : 'hide']();
    }
  }

  get opened() {
    return this._opened;
  }

  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.dialog = new A11yDialog(this.elementRef.nativeElement);

    // a11y-dialog closes the dialog on ESC by itself, without going through `opened`.
    // Left alone, the consumer's flag stays true, so the next `opened = true` isn't a
    // change and the modal never reopens. The guard keeps the closures we initiate
    // ourselves — where `opened` is already false — from emitting a second time.
    this.dialog.on('hide', () => {
      if (this._opened) {
        this.close();
      }
    });
  }

  close() {
    this.onClose.emit();
  }

}
