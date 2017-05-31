import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { StudySubject, Specimen } from '../../models/study-subject';
import { MatrixTube, MatrixPlate } from '../../models/plate';
import { Location } from '../../models/location';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-study-subject-entry-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-nav-list dense *ngIf="!activatedStudySubject">
      <h3 md-subheader>Study Subjects</h3>
      <md-list-item class="study-subject" *ngFor="let studySubject of studySubjects" (click)="activateStudySubject.emit(studySubject.id)">
        <md-icon md-list-icon>person</md-icon>
        <h4 md-line>UID: {{studySubject.uid}}</h4>
        <p md-line> <span><small>Added: {{studySubject.created | date}}</small></span></p>
      </md-list-item>
    </md-nav-list>
    <md-card *ngIf="activatedStudySubject">
      <md-card-title-group>
        <md-card-title>
          <md-icon>person</md-icon>Subject UID: {{ uid }}
        </md-card-title>
        <md-card-subtitle>
          <small class="date-added">Date Added: {{ dateAdded | date}}</small>
          <p class="error" *ngIf="deleteSubjectError"><span><small>{{deleteSubjectError}}</small></span></p>
        </md-card-subtitle>
        <div class="control-buttons">
          <button md-mini-fab class="delete-button" (click)="deleteSubject()">
            <md-icon>close</md-icon>
          </button>
          <button md-mini-fab class="back-button" (click)="deactivateStudySubject.emit()">
            <md-icon>arrow_back</md-icon>
          </button>
        </div>
      </md-card-title-group>
      <md-card-content>
        <md-list dense>
          <h3 md-subheader>Specimens</h3>
          <md-list-item *ngFor="let matrixTube of matrixTubes">
            <md-icon md-list-icon>adb</md-icon>
            <h4 md-line>{{specimenType(matrixTube)}}<span *ngIf="dateCollected(matrixTube)"> -- <small>Collected: {{dateCollected(matrixTube) | date}}</small></span></h4>
            <p md-line><span><small>{{location(matrixTube)}}, Plate {{plate(matrixTube)}}, Well {{well(matrixTube)}}</small></span></p>
            <p md-line *ngIf="comments(matrixTube)"><span><small>Comments: {{comments(matrixTube)}}</small></span></p>
            <p md-line><span><small>Barcode: {{barcode(matrixTube)}}</small></span></p>
          </md-list-item>
        </md-list>
      </md-card-content>
    </md-card>
    `,
    styles: [`
    md-card-title-group {
      margin-left: 0;
      min-height: 75px;
    }
    md-card-title {
      width: 100%
    }
    button {
      margin: 5px;
    }
    .control-buttons {
      width: 120px;
    }
    .date-added {
      color: grey;
    }
    .error {
      color: red;
    }
  `]
})
export class StudySubjectEntryListComponent {
  @Input() studySubjects: StudySubject[];
  @Input() activatedStudySubject: StudySubject;
  @Input() specimens: {[id: string]: Specimen};
  @Input() matrixTubes: MatrixTube[];
  @Input() matrixPlates: {[id: string]: MatrixPlate};
  @Input() locations: {[id: string]: Location};
  @Input() deleteSubjectError: string | null;
  @Input() specimenTypes: {[id: string]: SpecimenType};
  @Output() activateStudySubject = new EventEmitter();
  @Output() deactivateStudySubject = new EventEmitter();
  @Output() deleteStudySubject = new EventEmitter();

  get uid() {
    return this.activatedStudySubject.uid;
  };

  get dateAdded() {
    return this.activatedStudySubject.created;
  }

  specimenType(t: MatrixTube) {
    return this.specimenTypes[this.specimens[t.specimen].specimen_type].label;
  }

  location(t: MatrixTube) {
    return this.locations[this.matrixPlates[t.plate].location].description;
  }

  plate(t: MatrixTube) {
    return this.matrixPlates[t.plate].uid;
  }

  well(t: MatrixTube) {
    return t.well_position;
  }

  comments(t: MatrixTube) {
    return t.comments;
  }

  barcode(t: MatrixTube) {
    return t.barcode;
  }

  dateCollected(t: MatrixTube) {
    const specimen = this.specimens[t.specimen];
    return specimen.collection_date;
  }

  deleteSubject() {
    this.deleteStudySubject.emit(this.activatedStudySubject.id);
  }

}
