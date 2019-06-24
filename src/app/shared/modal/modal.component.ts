import { Component, Input, Output, EventEmitter, ContentChild, ElementRef, OnInit } from '@angular/core';
import * as A11yDialog from 'a11y-dialog';

@Component({
  selector: 'otp-modal',
  templateUrl: 'modal.component.html',
  styleUrls: ['modal.component.scss']
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
  }

  close() {
    this.onClose.emit();
  }

}
