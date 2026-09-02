import { Directive, ElementRef, Input, HostListener, OnChanges, SimpleChanges, forwardRef, Output, EventEmitter } from '@angular/core';
import { Validator, AbstractControl, ValidationErrors, NG_VALIDATORS, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import uniq from 'lodash/uniq';

const MAX_SIZE_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => Base64FileInputDirective),
  multi: true
};

const VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Base64FileInputDirective),
  multi: true
};

@Directive({
  selector: '[otpBase64FileInput][ngModel]',
  providers: [MAX_SIZE_VALIDATOR, VALUE_ACCESSOR],
  standalone: false
})
export class Base64FileInputDirective implements Validator, OnChanges, ControlValueAccessor {

  // Max size of the file, by default 2MB
  @Input() maxSize = 1024 * 1024 * 2;
  // State of the input
  @Output() loading = new EventEmitter<boolean>();

  private validatorCallback: () => void;
  private modelCallback: (_: string) => void;
  private touchCallback: (_: string) => void;
  private file: File;
  private base64: string;
  private conversionError: boolean;
  private worker: Worker;

  constructor(private el: ElementRef) {
    if (typeof Worker !== 'undefined') {
      // webpack 5 (Angular 12+) only bundles a worker when the URL is built with
      // `new URL(..., import.meta.url)`. With the previous plain-string path the worker was
      // never emitted and the request 404'd, so files were never base64-encoded.
      this.worker = new Worker(new URL('../base64-file-input.worker', import.meta.url), { type: 'module' });
    }
  }

  /**
   * Event handler executed when the attributes of the input change
   * @param {SimpleChanges} changes attributes
   */
  ngOnChanges(changes: SimpleChanges): void {
    for (const key in changes) {
      if (key === 'maxSize') {
        this.maxSize = +changes[key].currentValue;
        this.propagateChange();
      }
    }
  }

  @HostListener('change', ['$event.target'])
  async onChange(input: HTMLInputElement) {
    this.file = input.files[0];
    this.conversionError = false;

    // We trigger the validation each time the file is changed
    this.propagateChange();

    // If the file weights too much, we exit the event handler
    if (this.file && !this.isSizeValid(this.file)) {
      return;
    }

    // this could happen when the user clicks on cancel
    if (!this.file) {
      this.base64 = null;
      this.propagateChange();
      return;
    }

    this.loading.emit(true);

    const fileReadError = () => {
      this.base64 = null;
      this.conversionError = true;
      this.propagateChange();
      this.loading.emit(false);
    };

    const fileReadSuccess = ({ data }) => {
      if (data.error) {
        return fileReadError();
      }
      this.base64 = data;
      this.propagateChange();
      this.loading.emit(false);
    };

    if (this.worker) {
      this.worker.onmessage = fileReadSuccess;
      this.worker.onerror = fileReadError;
      this.worker.postMessage({ file: this.file });
    } else {
      this.readFileNoWorker(this.file, fileReadSuccess);
    }
  }

  /**
   * Return the list of errors
   * @param {AbstractControl} c
   * @returns {ValidationErrors}
   */
  validate(c: AbstractControl): ValidationErrors {
    if (!this.file) return null;

    const errors = {};
    if (!this.isSizeValid(this.file)) {
      errors['maxSize'] = true;
    }
    if (this.conversionError) {
      errors['conversion'] = true;
    }
    if (!this.isExtensionValid(this.file)) {
      errors['accept'] = true;
    }

    if (Object.keys(errors).length === 0) return null;

    return errors;
  }

  /**
   * Return whether the size of the file is valid
   * @param {File} file file to check
   * @returns {boolean}
   */
  isSizeValid(file: File): boolean {
    return file.size <= this.maxSize;
  }

  isExtensionValid(file: File): boolean {
    const input = this.el.nativeElement as HTMLInputElement;
    const acceptValue = input.getAttribute('accept');

    const allowedExtensions = this.parseAcceptAttribute(acceptValue);
    if (allowedExtensions.length === 0) {
      return true;
    }
    const fileExtension = this.getFileExtension(file.name);
    return allowedExtensions.includes(fileExtension);
  }

  private getFileExtension(filename: string): string {
    return (filename.split('.').pop() || '').toLowerCase();
  }

  private parseAcceptAttribute(acceptValue: string): string[] {
    const extensions: string[] = [];
    const items = acceptValue.split(',').map(item => item.trim());

    items.forEach(item => {
      if (item.startsWith('.')) {
        // Handle explicit extensions (.jpg)
        extensions.push(item.slice(1).toLowerCase());
      } else if (item.includes('/')) {
        // Handle MIME types (image/jpeg)
        const parts = item.split('/');
        if (parts[1] !== '*' && !parts[1].includes('*')) {
          extensions.push(parts[1].toLowerCase());
        }
      } else {
        // Handle extension-only values (jpg)
        extensions.push(item.toLowerCase());
      }
    });

    return uniq(extensions);
  }

  /**
   * This method pass us the function to call when we modify the
   * value of the input from the inside
   * The function will trigger the validation
   * @param {() => void} fn
   */
  registerOnValidatorChange(fn: () => void): void {
    this.validatorCallback = fn;
  }

  /**
   * Method executed by the outside world when the input receives a value
   * @param {*} obj
   */
  writeValue(obj: any): void {
    if (obj === null || obj === undefined) {
      this.base64 = null;
      this.el.nativeElement.value = '';
    } else {
      // NOTE: obj must be a base64 string here
      this.base64 = obj;
    }

  }

  /**
   * This method pass us the function to call when we modify the
   * value of the input from the inside
   * The function will update ngModel
   * @param {() => void} fn
   */
  registerOnChange(fn: any): void {
    this.modelCallback = fn;
  }

  /**
   * This method pass us the function to call when we modify the
   * value of the input from the inside
   * The function will update ngModel
   * @param {() => void} fn
   */
  registerOnTouched(fn: any): void {
    this.touchCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  /**
   * Propage the change to the validator and the model
   */
  propagateChange(): void {
    if (this.validatorCallback) {
      this.validatorCallback();
    }

    if (this.modelCallback) {
      this.modelCallback(this.base64);
    }

    if (this.touchCallback) {
      this.touchCallback(this.base64);
    }
  }

  /**
   * Convert the file to base64
   */
  readFileNoWorker(file: File, onSuccess: (result: { data: string }) => void) {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', ({ target}: Event) => {
      onSuccess({ data: ((target as FileReader).result as string) });
    });

    fileReader.readAsDataURL(file);
  }

}
