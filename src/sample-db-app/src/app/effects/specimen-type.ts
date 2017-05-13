import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatMap';
import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import { SpecimenType } from '../models/specimen-type';
import { SpecimenTypeService } from '../services/specimen-type';
import * as specimenType from '../actions/specimen-type';

@Injectable()
export class SpecimenTypeEffects {

  @Effect()
  get$: Observable<Action> = this.actions$
    .ofType(specimenType.GET_ALL)
    .map(toPayload)
    .switchMap(() => {
      return this.specimenTypeService.getSpecimenTypes()
        .map(specimenTypes => new specimenType.LoadSuccessAction(specimenTypes))
        .catch(err => {
          return of(new specimenType.LoadSuccessAction([]));
        });
    });

  @Effect()
  create$: Observable<Action> = this.actions$
    .ofType(specimenType.CREATE)
    .map(toPayload)
    .switchMap(payload => {
      return this.specimenTypeService.createSpecimenType(payload)
        .map(() => go('specimen-type'))
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new specimenType.CreateFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        });
      });

  @Effect()
  delete$: Observable<Action> = this.actions$
    .ofType(specimenType.DELETE)
    .map(toPayload)
    .switchMap(payload => {
      return this.specimenTypeService.deleteSpecimenType(payload)
        .concatMap(() => {
          return [ go('specimen-type'), new specimenType.DeleteSuccessAction(payload), ];
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new specimenType.DeleteFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        });
    });

  @Effect()
  update$: Observable<Action> = this.actions$
    .ofType(specimenType.UPDATE)
    .map(toPayload)
    .switchMap(payload => {
      return this.specimenTypeService.updateSpecimenType(payload)
        .mergeMap((updatedspecimenType: SpecimenType) => {
          return [ new specimenType.LoadOneAction(updatedspecimenType), go('specimen-type') ]
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new specimenType.UpdateFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        })
    })

  constructor(private actions$: Actions, private specimenTypeService: SpecimenTypeService) { }
}
