import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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

    // If the backend returns success after 
    // an invalid (empty or incorrectly composed) file
    if (!response) {
      this.errors.push({
        line: 1,
        type: 'file',
        description: 'invalid file'
      });
    }

    if (response && Object.keys(response).length) {
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
    private translateService: TranslateService,
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
    return this.response === null || !!Object.keys(this.response).length;
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
        // For processing an empty object
        this.response = response && Object.keys(response).length ? response : null;
        this.reuploadFileInput.nativeElement.value = '';
      },
      (error) => {
        console.error(error);
        this.translateService.get('uploadFile.errorHeader').subscribe(phrase => alert(phrase));
        this.exit.emit(true);
        this.reuploadFileInput.nativeElement.value = '';
      });
  }

}
