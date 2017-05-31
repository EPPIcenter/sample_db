import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/mergeMap';
import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import { Study, StudyEntry } from '../models/study';
import { StudyService } from '../services/study';
import * as study from '../actions/study';

@Injectable()
export class StudyEffects {

  @Effect()
  get$: Observable<Action> = this.actions$
    .ofType(study.GET_ALL)
    .map(toPayload)
    .switchMap(() => {
      return this.studyService.getStudies()
        .map(studies => new study.LoadSuccessAction(studies))
        .catch(err => {
          return of(new study.LoadSuccessAction([]));
        });
    });


  @Effect()
  create$: Observable<Action> = this.actions$
    .ofType(study.CREATE)
    .map(toPayload)
    .switchMap(payload => {
      return this.studyService.createStudy(payload)
        .map(() => go('study'))
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new study.CreateFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        });
      });

  @Effect()
  delete$: Observable<Action> = this.actions$
    .ofType(study.DELETE)
    .map(toPayload)
    .switchMap(payload => {
      return this.studyService.deleteStudy(payload)
        .mergeMap(() => {
          return [ new study.DeleteSuccessAction(payload), go('study') ];
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new study.DeleteFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        });
    });

  @Effect()
  update$: Observable<Action> = this.actions$
    .ofType(study.UPDATE)
    .map(toPayload)
    .switchMap(payload => {
      return this.studyService.updateStudy(payload)
        .mergeMap((updatedStudyEntry: StudyEntry) => {
          return [ new study.LoadOneAction(updatedStudyEntry), go('study') ];
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new study.UpdateFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        })
    });

  @Effect()
  deleteSubject$: Observable<Action> = this.actions$
    .ofType(study.DELETE_SUBJECT)
    .map(toPayload)
    .switchMap(payload => {
      return this.studyService.deleteStudySubject(payload)
        .mergeMap(() => {
          return [ new study.DeleteSubjectSuccessAction(payload)];
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new study.DeleteSubjectFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        })
    })

  constructor(private actions$: Actions, private studyService: StudyService) { }
}
