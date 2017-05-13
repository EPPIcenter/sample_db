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

import { Location } from '../models/location';
import { LocationService } from '../services/location';
import * as location from '../actions/location';

@Injectable()
export class LocationEffects {

  @Effect()
  get$: Observable<Action> = this.actions$
    .ofType(location.GET_ALL)
    .map(toPayload)
    .switchMap(() => {
      return this.locationService.getLocations()
        .map(locations => new location.LoadSuccessAction(locations))
        .catch(err => {
          return of(new location.LoadSuccessAction([]));
        });
    });

  @Effect()
  create$: Observable<Action> = this.actions$
    .ofType(location.CREATE)
    .map(toPayload)
    .switchMap(payload => {
      return this.locationService.createLocation(payload)
        .map(() => go('location'))
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new location.CreateFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        });
      });

  @Effect()
  delete$: Observable<Action> = this.actions$
    .ofType(location.DELETE)
    .map(toPayload)
    .switchMap(payload => {
      return this.locationService.deleteLocation(payload)
        .mergeMap(() => {
          return [ new location.DeleteSuccessAction(payload), go('location') ];
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new location.DeleteFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        });
    });

  @Effect()
  update$: Observable<Action> = this.actions$
    .ofType(location.UPDATE)
    .map(toPayload)
    .switchMap(payload => {
      return this.locationService.updateLocation(payload)
        .mergeMap((updatedlocation: Location) => {
          return [ new location.LoadOneAction(updatedlocation), go('location') ]
        })
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            return of(new location.UpdateFailureAction(JSON.parse(err._body).message));
          } else {
            throw(new Error(err));
          }
        })
    })

  constructor(private actions$: Actions, private locationService: LocationService) { }
}
