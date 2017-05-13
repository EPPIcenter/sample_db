import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { SearchService } from '../services/search';
import * as search from '../actions/search';

@Injectable()
export class SearchEffects {

  @Effect()
  searchSpecimens$: Observable<Action> = this.actions$
    .ofType(search.SEARCH_SPECIMENS)
    .map(toPayload)
    .switchMap(file => {
      return this.searchService.searchSpecimens(file)
        .map(success => new search.SearchSpecimensSuccessAction())
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            if (err.message) {
              return of(new search.SearchSpecimensFailureAction(err.message));
            } else {
              return of(new search.SearchSpecimensFailureAction(JSON.parse(err._body).message));
            }
          } else {
            throw(new Error(err));
          }
        });
    });

  @Effect()
  searchBarcodes$: Observable<Action> = this.actions$
    .ofType(search.SEARCH_BARCODES)
    .map(toPayload)
    .switchMap(file => {
      return this.searchService.searchBarcodes(file)
        .map(success => new search.SearchBarcodesSuccessAction())
        .catch(err => {
          if (err.status < 500 && err.status > 400) {
            if (err.message) {
              return of(new search.SearchBarcodesFailureAction(err.message));
            } else {
              return of(new search.SearchBarcodesFailureAction(JSON.parse(err._body).message));
            }
          } else {
            throw(new Error(err));
          }
        });
    });

  constructor(private actions$: Actions, private searchService: SearchService) { }
}
