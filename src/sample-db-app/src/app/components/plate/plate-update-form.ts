import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import { MatrixPlate } from '../../models/plate';

@Component({
  selector: 'sdb-plate-update-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card>
      <md-card-title-group>
        <md-card-title>
          Update Matrix Tube Locations
        </md-card-title>
        <md-card-subtitle>Select all plates to update. Filenames should be plate UIDs.</md-card-subtitle>
      </md-card-title-group>
      <md-card-content>
        <sdb-file-input placeholder="fileInputPlaceholder" multiple="multipleFiles" (fileChangeEvent)="selectFiles($event)">
        </sdb-file-input>
      </md-card-content>
      <md-card-actions>
        <button md-raised-button color="primary" (click)="submitPlates()">Submit</button>
        <button md-raised-button color="accent" (click)="cancelButton.emit()">Cancel</button>
      </md-card-actions>
      <md-card-footer *ngIf="error">
        <span class="error">{{error}}</span>
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
    .error {
      font-size: 12px;
      color: red;
    }
  `]
})
export class MatrixPlateUpdateFormComponent {
  @Input() error: string;
  @Output() submitButton = new EventEmitter();
  @Output() cancelButton = new EventEmitter();

  fileInputPlaceholder = "Select all plates to be updated...";
  multipleFiles = true;

  selectedFiles: FileList;

  selectFiles(f) {
    if (f) {
      this.selectedFiles = f.target.files;
    } else {
      this.selectFiles = null;
    }
  }

  submitPlates() {
    this.submitButton.emit(this.selectedFiles);
  }

}
