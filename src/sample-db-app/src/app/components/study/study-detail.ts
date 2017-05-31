import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Study } from '../../models/study';
import { StudySubject, Specimen } from '../../models/study-subject';
import { MatrixTube, MatrixPlate } from '../../models/plate';
import { Location } from '../../models/location';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-study-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card *ngIf="study">
      <md-card-title-group>
        <md-card-title>
          {{ title }}
          <small class="short-code">({{ shortCode }})</small>
        </md-card-title>
        <div class="control-buttons">
          <button md-mini-fab class="edit-button" mdTooltip="Edit Study" (click)="editButton.emit()">
            <md-icon>edit</md-icon>
          </button>
          <button md-mini-fab class="delete-button" mdTooltip="Delete Study" (click)="deleteButton.emit()">
            <md-icon>close</md-icon>
          </button>
        </div>
        <md-card-subtitle *ngIf="description">{{ description }}</md-card-subtitle>
      </md-card-title-group>
      <md-card-content>
        <p> Lead: {{ leadPerson }} </p>
        <p> Created: {{ created | date:"mediumDate" }} </p>
        <p> Last Updated: {{lastUpdated | date:"mediumDate" }} </p>
        <p class="error" *ngIf="deleteError"><span><small>{{deleteError}}</small></span></p>
        <div class="subject-list">
          <sdb-study-subject-entry-list
            [studySubjects]="studySubjects"
            [activatedStudySubject]="activatedStudySubject"
            [specimens]="specimens"
            [matrixTubes]="matrixTubes"
            [matrixPlates]="matrixPlates"
            [locations]="locations"
            [specimenTypes]="specimenTypes"
            [deleteSubjectError]="deleteSubjectError"
            (activateStudySubject)="activateStudySubject.emit($event)"
            (deactivateStudySubject)="deactivateStudySubject.emit()"
            (deleteStudySubject)="deleteStudySubject.emit($event)">
          </sdb-study-subject-entry-list>
        </div>
      </md-card-content>
    </md-card>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      margin: 10px 0;
    }
    md-card {
      min-width: 85vw;
    }
    md-card-title-group {
      margin-left: 0;
      min-height: 75px;
    }
    img {
      width: 60px;
      min-width: 60px;
      margin-left: 5px;
    }
    md-card-content {
      margin: 0px 0 50px;
      height: 70vh;
    }
    md-card-actions {
      margin: 25px 0 0 !important;
    }
    md-card-footer {
      padding: 0 25px 25px;
      position: relative;
    }
    .short-code {
      color: grey;
    }
    md-card-title {
      width: 100%
    }
    .edit-button {
      margin-bottom: 5px;
    }
    .control-buttons {
      width: 40px;
    }
    .subject-list {
      height: 83%;
      overflow-y: scroll;
    }
    .error {
      color: red;
    }
  `]
})
export class StudyDetailComponent {
  @Output() editButton = new EventEmitter();
  @Output() deleteButton = new EventEmitter();
  @Output() activateStudySubject = new EventEmitter();
  @Output() deactivateStudySubject = new EventEmitter();
  @Output() deleteStudySubject = new EventEmitter();
  @Input() study: Study;
  @Input() deleteError: string;
  @Input() deleteSubjectError: string;
  @Input() studySubjects: StudySubject[];
  @Input() activatedStudySubject: StudySubject;
  @Input() specimens: {[id: string]: Specimen};
  @Input() matrixTubes: MatrixTube[];
  @Input() matrixPlates: {[id: string]: MatrixPlate};
  @Input() locations: {[id: string]: Location};
  @Input() specimenTypes: {[id: string]: SpecimenType};

  get title() {
    return this.study.title;
  }

  get shortCode() {
    return this.study.short_code;
  }

  get description() {
    return this.study.description;
  }

  get created() {
    return this.study.created;
  }

  get lastUpdated() {
    return this.study.last_updated;
  }

  get leadPerson() {
    return this.study.lead_person;
  }

}
