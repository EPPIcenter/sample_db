import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sdb-search-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card>
      <md-card-title-group>
        <md-card-title>
          {{ title }}
        </md-card-title>
      </md-card-title-group>
      <md-card-content>
        <sdb-file-input multiple="multipleFiles" (fileChangeEvent)="selectFile($event)">
        </sdb-file-input>
      </md-card-content>
      <md-card-actions>
        <button md-raised-button color="primary" (click)="submitFile()">Submit</button>
      </md-card-actions>
      <md-card-footer *ngIf="error || success">
        <p><span class="error">{{ error }}</span></p>
        <p><span class="success">{{ success }}</span></p>
      </md-card-footer>
    </md-card>
  `,
  styles: [`
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .full-width {
      width: 100%;
    }
    button {
      margin-top: 10px;
    }
    md-card {
      margin-top: 15px;
      width: 75%;
    }
    .success {
      font-size: 12px;
      color: green;
    }
    .error {
      font-size: 12px;
      color: red;
    }
  `]
})
export class SearchFileComponent {
  @Input() title: string;
  @Input() error: string;
  @Input() success: string;
  @Output() submit = new EventEmitter();

  selectedFile: File;
  multipleFiles = false;

  selectFile(f) {
    if (f) {
      this.selectedFile = f.target.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  submitFile() {
    this.submit.emit(this.selectedFile);
  }

}
