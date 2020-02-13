import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ObservationsService } from 'app/services/observations.service';

export interface ErrorLine {
  line: number;
  type: string;
  description: string;
}

@Component({
  selector: 'otp-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent {
  public errors: ErrorLine[] = [];
  public recordsNumber: number;
  private _response: any = {};

  @ViewChild('reuploadFileInput') reuploadFileInput: ElementRef;
  @Output() exit: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() set response(response: any) {
    this._response = response;
    if (Object.keys(response).length) {
      this.recordsNumber = Object.keys(response).length;
      for (let index in response) {
        if (Object.keys(response[index].errors).length) {
          this.generateErrorLines(response, +index);
        }
      }
    }
  }

  get response() { return this._response; }

  constructor(
    private service: ObservationsService,
  ) { }

  private generateErrorLines(response: any, index: number): void {
    for (let recordType in response[index].errors) {
      for (let field in response[index].errors[recordType]) {
        const description = `${field}: ${response[index].errors[recordType][field]}`;
        this.errors.push({
          line: index,
          type: recordType,
          description: description
        });
      }
    }
  }

  public get hasResponse(): boolean {
    return !!Object.keys(this.response).length;
  }

  public reuploadFile(files: FileList): void {
    this.response = {};
    this.errors = [];
    const file: File = files[0];
    const formData = new FormData();
    formData.append('import[file]', file);
    formData.append('import[importer_type]', 'observations');
    this.service.uploadFile(formData).subscribe(
      (response) => {
        this.response = response;
        this.reuploadFileInput.nativeElement.value = '';
      },
      () => this.reuploadFileInput.nativeElement.value = '');
  }

}
