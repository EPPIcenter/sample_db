import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';
import * as _ from 'underscore';

import * as fromRoot from '../../reducers';
import * as matrixPlate from '../../actions/plate';
import { MatrixPlate, MatrixTube } from '../../models/plate';
import { Location } from '../../models/location';
import { Study } from '../../models/study';
import { Specimen, StudySubject } from '../../models/study-subject';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-selected-plate-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-plate-detail
    (deleteButton)="deletePlate()"
    [plate]="plate$ | async"
    [location]="location$ | async"
    [matrixTubes]="matrixTubes$ | async"
    [specimens]="specimens$ | async"
    [studySubjects]="studySubjects$ | async"
    [studies]="studies$ | async"
    [specimenTypes]="specimenTypes$ | async"
    [error]="deleteError$ | async">
  </sdb-plate-detail>
  `
})
export class SelectedMatrixPlatePageComponent {
  plate$: Observable<MatrixPlate>;
  location$: Observable<Location>;
  matrixTubes$: Observable<MatrixTube[]>;
  specimens$: Observable<{[id: string]: Specimen}>;
  studySubjects$: Observable<{[id: string]: StudySubject}>;
  studies$: Observable<{[id: string]: Study}>;
  specimenTypes$: Observable<{[id: string]: SpecimenType}>;
  deleteError$: Observable<string>;

  constructor(private store: Store<fromRoot.State>) {
    this.plate$ = store.select(fromRoot.getSelectedMatrixPlate);
    this.location$ = store.select(fromRoot.getSelectedMatrixPlateLocation);

    const sortProperty$ = of('well_position');
    this.matrixTubes$ = store.select(fromRoot.getSelectedMatrixPlateTubes);
    this.matrixTubes$ = combineLatest(sortProperty$, this.matrixTubes$, (prop, items) => {
      return _.sortBy(items, prop);
    });

    this.specimens$ = store.select(fromRoot.getSelectedMatrixPlateSpecimens);
    this.studySubjects$ = store.select(fromRoot.getSelectedMatrixPlateStudySubjects);
    this.studies$ = store.select(fromRoot.getStudyEntities);
    this.specimenTypes$ = store.select(fromRoot.getSpecimenTypeEntities);
    this.deleteError$ = store.select(fromRoot.getDeleteMatrixPlateError);
  }

  deletePlate() {
    this.plate$.take(1).subscribe(selectedPlate => {
      if (selectedPlate.tubes.length === 0) {
        this.store.dispatch(new matrixPlate.DeleteAction(selectedPlate.id));
      } else {
        this.store.dispatch(new matrixPlate.DeleteFailureAction("Cannot delete plate with tubes"));
      }
    });
  }
}
