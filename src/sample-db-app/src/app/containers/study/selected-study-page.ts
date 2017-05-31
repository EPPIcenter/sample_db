import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as study from '../../actions/study';
import { Study } from '../../models/study';
import { StudySubject, Specimen } from '../../models/study-subject';
import { MatrixPlate, MatrixTube } from '../../models/plate';
import { Location } from '../../models/location';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-selected-study-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-study-detail (deleteButton)="deleteStudy()" (editButton)="editStudy()"
    [study]="study$ | async"
    [deleteSubjectError]="deleteSubjectError$ | async"
    [deleteError]="deleteError$ | async"
    [studySubjects]="studySubjects$ | async"
    [activatedStudySubject]="activatedStudySubject$ | async"
    [specimens]="specimens$ | async"
    [matrixTubes]="matrixTubes$ | async"
    [matrixPlates]="matrixPlates$ | async"
    [locations]="locations$ | async"
    [specimenTypes]="specimenTypes$ | async"
    (activateStudySubject)="activateStudySubject($event)"
    (deactivateStudySubject)="deactivateStudySubject()"
    (deleteStudySubject)="deleteStudySubject($event)">
  </sdb-study-detail>
  `
})
export class SelectedStudyPageComponent {
  study$: Observable<Study>;
  studySubjects$: Observable<StudySubject[]>;
  activatedStudySubject$: Observable<StudySubject>;
  specimens$: Observable<{[id: string]: Specimen}>;
  matrixTubes$: Observable<MatrixTube[]>;
  matrixPlates$: Observable<{[id: string]: MatrixPlate}>;
  locations$: Observable<{[id: string]: Location}>;
  specimenTypes$: Observable<{[id: string]: SpecimenType}>;
  studyId$: Observable<string>;
  deleteError$: Observable<string>;
  deleteSubjectError$: Observable<string>;

  constructor(private store: Store<fromRoot.State>) {
    this.study$ = store.select(fromRoot.getSelectedStudy);
    this.studySubjects$ = store.select(fromRoot.getSelectedStudySubjects);
    this.activatedStudySubject$ = store.select(fromRoot.getActivatedStudySubject);
    this.specimens$ = store.select(fromRoot.getActivatedStudySubjectSpecimens);
    this.matrixTubes$ = store.select(fromRoot.getActivatedStudySubjectMatrixTubes);
    this.matrixPlates$ = store.select(fromRoot.getMatrixPlateEntities);
    this.locations$ = store.select(fromRoot.getLocationEntities);
    this.specimenTypes$ = store.select(fromRoot.getSpecimenTypeEntities);
    this.studyId$ = store.select(fromRoot.getSelectedStudyId);
    this.deleteError$ = store.select(fromRoot.getDeleteStudyError);
    this.deleteSubjectError$ = store.select(fromRoot.getDeleteSubjectError);
  }

  deleteStudy() {
    this.studyId$.take(1).subscribe(selectedStudyId => {
      this.store.dispatch(new study.DeleteAction(selectedStudyId));
    });
  }

  editStudy() {
    this.studyId$.take(1).subscribe(selectedStudyId => {
      this.store.dispatch(go(`/study/${selectedStudyId}/edit`));
    });
  }

  activateStudySubject(id) {
    this.store.dispatch(new study.ActivateSubjectAction(id));
  }

  deactivateStudySubject() {
    this.store.dispatch(new study.DeactivateSubjectAction());
  }

  deleteStudySubject(id) {
    this.store.dispatch(new study.DeleteSubjectAction(id));
  }

}
