import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import { MatrixPlate, MatrixTube } from '../../models/plate';
import { Specimen, StudySubject } from '../../models/study-subject';
import { Location } from '../../models/location';
import { Study } from '../../models/study';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-plate-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card>
      <md-card-title-group>
        <md-card-title>
          {{ uid }}
          <md-card-subtitle>
            <small class="plate-location">{{ plateLocation }}</small>
          </md-card-subtitle>
        </md-card-title>
        <div class="control-buttons">
          <button md-mini-fab class="control-button" mdTooltip="Toggle Hidden" (click)="toggleHidden.emit()">
            <md-icon>{{visibility}}</md-icon>
          </button>
          <button md-mini-fab class="control-button" mdTooltip="Delete Plate" (click)="deleteButton.emit()">
            <md-icon>close</md-icon>
          </button>
        </div>
      </md-card-title-group>
      <md-card-content>
        <span *ngIf="error" class="error">{{ error }}</span>
        <div  *ngIf="plate && matrixTubes && specimens && studySubjects && studies && specimenTypes" class="tube-list">
          <md-list dense>
            <h3 md-subheader>Matrix Tubes</h3>
            <md-list-item *ngFor="let tube of matrixTubes">
              <md-icon md-list-icon>opacity</md-icon>
              <h4 md-line>
              {{wellPosition(tube)}} || {{specimenType(tube)}}
                <span *ngIf="dateCollected(tube)"> -- <small>Collected: {{dateCollected(tube) | date}}</small>
                </span>
              </h4>
              <p md-line><span><small>Barcode: {{barcode(tube)}}</small></span></p>
              <p md-line><span><small>Study: {{studyCode(tube)}}</small></span></p>
              <p md-line><span><small>Subject UID: {{subjectUID(tube)}}</small></span></p>
              <p md-line *ngIf="comments(tube)"><span><small>Comments: {{comments(tube)}}</small></span></p>
            </md-list-item>
          </md-list>
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
      height: 70vh
    }
    md-card-actions {
      margin: 25px 0 0 !important;
    }
    md-card-footer {
      padding: 0 25px 25px;
      position: relative;
    }
    .plate-location {
      color: grey;
    }
    md-card-title {
      width: 100%
    }
    .control-button {
      margin-bottom: 5px;
    }
    .control-buttons {
      width: 40px;
    }
    .error {
      color: red;
    }
    .tube-list {
      height: 100%;
      overflow-y: scroll;
    }
  `]
})
export class MatrixPlateDetailComponent {
  @Output() deleteButton = new EventEmitter();
  @Output() toggleHidden = new EventEmitter();
  @Input() plate: MatrixPlate;
  @Input() location: Location;
  @Input() matrixTubes: {[id: string]: MatrixTube};
  @Input() specimens: {[id: string]: Specimen};
  @Input() studySubjects: {[id: string]: StudySubject};
  @Input() studies: {[id: string]: Study};
  @Input() specimenTypes: {[id: string]: SpecimenType};
  @Input() error: string;


  get uid() {
    return this.plate.uid;
  }

  get plateLocation() {
    return this.location ? this.location.description : undefined;
  }

  get visibility() {
    return this.plate.hidden ? 'visibility' : 'visibility_off';
  }

  wellPosition(t: MatrixTube) {
    return t.well_position;
  }

  specimenType(t: MatrixTube) {
    const specimen = this.specimens[t.specimen];
    return this.specimenTypes[specimen.specimen_type].label;
  }

  dateCollected(t: MatrixTube) {
    const specimen = this.specimens[t.specimen];
    return specimen.collection_date;
  }

  barcode(t: MatrixTube) {
    return t.barcode;
  }

  studyCode(t: MatrixTube) {
    const specimen = this.specimens[t.specimen];
    const studySubject = this.studySubjects[specimen.study_subject];
    const study = this.studies[studySubject.study]
    return study.short_code;
  }

  subjectUID(t: MatrixTube) {
    const specimen = this.specimens[t.specimen];
    const studySubject = this.studySubjects[specimen.study_subject];
    return studySubject.uid;
  }

  comments(t: MatrixTube) {
    return t.comments;
  }

}
