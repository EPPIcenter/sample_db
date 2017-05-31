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

import { MatrixPlate, MatrixPlateEntry } from '../models/plate';
import { MatrixPlateService } from '../services/plate';
import * as matrixPlate from '../actions/plate';

@Injectable()
export class MatrixPlateEffects {

  @Effect()
  get$: Observable<Action> = this.actions$
    .ofType(matrixPlate.GET_ALL)
    .map(toPayload)
    .switchMap(() => {
      return this.matrixPlateService.getPlates()
        .map(plates => new matrixPlate.LoadSuccessAction(plates))
        .catch(err => {
          return of(new matrixPlate.LoadSuccessAction([]));
        });
    });

  @Effect()
  delete$: Observable<Action> = this.actions$
    .ofType(matrixPlate.DELETE)
    .map(toPayload)
    .switchMap(payload => {
      return this.matrixPlateService.deletePlate(payload)
      .concatMap(() => {
        return [ go('plate'), new matrixPlate.DeleteSuccessAction(payload) ];
      })
      .catch(err => {
        if (err.status < 500 && err.status > 400) {
          return of(new matrixPlate.DeleteFailureAction(JSON.parse(err._body).message));
        } else {
          throw(new Error(err));
        }
      });
    });

  @Effect()
  upload$: Observable<Action> = this.actions$
    .ofType(matrixPlate.UPLOAD)
    .map(toPayload)
    .switchMap(payload => {
      return this.matrixPlateService.uploadPlate(payload)
        .concatMap((newMatrixPlateEntry: MatrixPlateEntry) => {
           return [ new matrixPlate.LoadOneAction(newMatrixPlateEntry), go('plate') ];
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            if (err.message) {
              return of(new matrixPlate.UploadFailureAction(err.message));
            } else {
              return of(new matrixPlate.UploadFailureAction(JSON.parse(err._body).message));
            }
          } else {
            throw(new Error(err));
          }
        });
    });

  @Effect()
  update$: Observable<Action> = this.actions$
    .ofType(matrixPlate.UPDATE)
    .map(toPayload)
    .switchMap(payload => {
      return this.matrixPlateService.updatePlates(payload)
        .concatMap((updatedMatrixPlateEntry: MatrixPlateEntry) => {
          const actions: Action[] = [];
          let parsedMatrixPlate: MatrixPlate | MatrixPlate[];
          if (Array.isArray(updatedMatrixPlateEntry.matrix_plate)) {
            parsedMatrixPlate = updatedMatrixPlateEntry.matrix_plate.map(matrixPlate => {
              return Object.assign(matrixPlate, {
                '_detailed': true,
                'created': new Date(matrixPlate.created),
                'last_updated': new Date(matrixPlate.last_updated)
              });
            });
          } else {
            updatedMatrixPlateEntry.matrix_plate = Object.assign(updatedMatrixPlateEntry.matrix_plate, {
              '_detailed': true,
              'created': new Date(updatedMatrixPlateEntry.matrix_plate.created),
              'last_updated': new Date(updatedMatrixPlateEntry.matrix_plate.last_updated)
            });
            parsedMatrixPlate = updatedMatrixPlateEntry.matrix_plate;
          }

          updatedMatrixPlateEntry.matrix_plate = parsedMatrixPlate;
          actions.push(new matrixPlate.LoadOneAction(updatedMatrixPlateEntry));
          actions.push(go('plate'));
          return actions;
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            if (err.message) {
              return of(new matrixPlate.UpdateFailureAction(err.message));
            } else {
              return of(new matrixPlate.UpdateFailureAction(JSON.parse(err._body).message));
            }
          } else {
            throw(new Error(err));
          }
        });
    });


  constructor(private actions$: Actions, private matrixPlateService: MatrixPlateService) { }
}
