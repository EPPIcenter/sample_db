import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import { MatrixPlate } from '../../models/plate';
import { Study } from '../../models/study';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-plate-upload-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card>
      <md-card-content>
        <form>
          <p>
            <md-select required name="selectedLocation" [(ngModel)]="selectedLocation" placeholder="Location">
              <md-option *ngFor="let location of locations" [value]="location.id">{{location.description}}</md-option>
            </md-select>
          </p>
          <p>
            <md-input-container>
              <input mdInput type="text" name="plateuid" [(ngModel)]="plateUID" placeholder="Plate UID" required>
            </md-input-container>
          </p>
          <p>
            <md-checkbox name="createSubjects" [(ngModel)]="createSubjects">Create Missing Subjects</md-checkbox>
          </p>
          <p>
            <md-checkbox name="createSpecimens" [(ngModel)]="createSpecimens">Create Missing Specimens</md-checkbox>
          </p>
          <sdb-file-input placeholder="fileInputPlaceholder" multiple="multipleFiles" (fileChangeEvent)="selectFile($event)">
          </sdb-file-input>
        </form>
      </md-card-content>
      <md-card-actions>
        <button md-raised-button color="primary" (click)="submitPlate()">Submit</button>
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
    m d-card {
      margin-top: 15px;
      width: 75%;
    }
    .error {
      font-size: 12px;
      color: red;
    }
  `]
})
export class MatrixPlateUploadFormComponent {
  @Input() locations: Location[];
  @Input() studies: Study[];
  @Input() error: string;
  @Output() submitButton = new EventEmitter();
  @Output() cancelButton = new EventEmitter();

  selectedLocation: string;
  plateUID: string;
  selectedStudy: string;
  createSubjects = true;
  createSpecimens = true;
  selectedFile: any;

  locationPlaceholder = 'Location';
  studyPlaceholder = 'Study';
  fileInputPlaceholder = "Select Plate File";
  multipleFiles = false;

  selectFile(f) {
    if (f) {
      this.selectedFile = f.target.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  submitPlate() {
    this.submitButton.emit({
      'file': this.selectedFile,
      'plate_uid': this.plateUID,
      'location_id': this.selectedLocation,
      'create_missing_subjects': this.createSubjects,
      'create_missing_specimens': this.createSpecimens
    });
  }
}
