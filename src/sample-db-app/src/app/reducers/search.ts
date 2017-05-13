import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import * as search from '../actions/search';

export interface State {
  searchSpecimensError: string | null;
  searchBarcodesError: string | null;
}

export const initialState: State = {
  searchSpecimensError: null,
  searchBarcodesError: null
};

export function reducer(state = initialState, action: search.Actions): State {
  switch (action.type) {
    case search.SEARCH_SPECIMENS_FAILURE:
      const specimensErr = action.payload;
      return Object.assign({}, state, {
        searchSpecimensError: specimensErr
      });

    case search.SEARCH_BARCODES_FAILURE:
      const barcodesErr = action.payload;
      return Object.assign({}, state, {
        searchBarcodesError: barcodesErr
      });

    case search.SEARCH_SPECIMENS_SUCCESS:
      return Object.assign({}, state, {
        searchSpecimensError: null
      });

    case search.SEARCH_BARCODES_SUCCESS:
      return Object.assign({}, state, {
        searchBarcodesError: null
      });

    case search.CLEAR_ERRORS:
      return Object.assign({}, state, {
        searchBarcodesError: null,
        searchSpecimensError: null
      });

    default:
      return state;
  }
};

export const getSearchSpecimensError = (state: State) => state.searchSpecimensError;

export const getSearchBarcodesError = (state: State) => state.searchBarcodesError;
