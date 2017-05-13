import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { BulkService } from '../services/bulk';
import * as bulk from '../actions/bulk';

@Injectable()
export class BulkEffects {

  @Effect()
  deleteSpecimens$: Observable<Action> = this.actions$
    .ofType(bulk.DELETE_SPECIMENS)
    .map(toPayload)
    .switchMap(file => {
      return this.bulkService.deleteSpecimens(file)
        .map(deleteQuery => new bulk.DeleteSpecimensSuccessAction(deleteQuery))
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            if (err.message) {
              return of(new bulk.DeleteSpecimensFailureAction(err.message));
            } else {
              return of(new bulk.DeleteSpecimensFailureAction(JSON.parse(err._body).message));
            }
          } else {
            throw(new Error(err));
          }
        });
    });

  @Effect()
  deleteBarcodes$: Observable<Action> = this.actions$
    .ofType(bulk.DELETE_BARCODES)
    .map(toPayload)
    .switchMap(file => {
      return this.bulkService.deleteBarcodes(file)
        .map(deleteQuery => new bulk.DeleteBarcodesSuccessAction(deleteQuery))
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            if (err.message) {
              return of(new bulk.DeleteBarcodesFailureAction(err.message));
            } else {
              return of(new bulk.DeleteBarcodesFailureAction(JSON.parse(err._body).message));
            }
          } else {
            throw(new Error(err));
          }
        });
    });


  constructor(private actions$: Actions, private bulkService: BulkService) {}
}
