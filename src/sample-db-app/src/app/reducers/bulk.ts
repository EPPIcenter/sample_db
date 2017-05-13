import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import * as bulk from '../actions/bulk';

export interface State {
  deleteSpecimensError: string | null;
  deleteSpecimensSuccess: string | null;
  deleteBarcodesError: string | null;
  deleteBarcodesSuccess: string | null;
}

export const initialState: State = {
  deleteSpecimensError: null,
  deleteBarcodesError: null,
  deleteSpecimensSuccess: null,
  deleteBarcodesSuccess: null
};

export function reducer(state = initialState, action: bulk.Actions): State {
  switch (action.type) {
    case bulk.DELETE_BARCODES_FAILURE:
      const barcodesErr = action.payload;
      return Object.assign({}, state, {
        deleteBarcodesError: barcodesErr,
        deleteBarcodesSuccess: null
      });

    case bulk.DELETE_BARCODES_SUCCESS:
      const barcodeDelQuery = action.payload;
      const barcodeNumTubesDeleted = barcodeDelQuery.matrixTubeIds.length;
      const barcodeNumSpecimensDeleted = barcodeDelQuery.specimenIds.length;
      const barcodeMsg = 'Successfully Deleted ' + barcodeNumSpecimensDeleted.toString() +
                  ' Specimens and ' + barcodeNumTubesDeleted.toString() + ' Matrix Tubes.';

      return Object.assign({}, state, {
        deleteBarcodesError: null,
        deleteBarcodesSuccess: barcodeMsg
      });

    case bulk.DELETE_SPECIMENS_FAILURE:
      const specimensErr = action.payload;
      return Object.assign({}, state, {
        deleteSpecimensError: specimensErr
      });

    case bulk.DELETE_SPECIMENS_SUCCESS:
      const specimenDelQuery = action.payload;
      const specimenNumTubesDeleted = specimenDelQuery.matrixTubeIds.length;
      const specimenNumSpecimensDeleted = specimenDelQuery.specimenIds.length;
      const specimenMsg = 'Successfully Deleted ' + specimenNumSpecimensDeleted.toString() +
                  ' Specimens and ' + specimenNumTubesDeleted.toString() + ' Matrix Tubes.';
      return Object.assign({}, state, {
        deleteSpecimensError: null,
        deleteSpecimensSuccess: specimenMsg
      });

    case bulk.CLEAR_ERRORS:
      return Object.assign({}, state, {
        deleteSpecimensError: null,
        deleteBarcodesError: null,
        deleteSpecimensSuccess: null,
        deleteBarcodesSuccess: null
      });

    default:
      return state;
  }
}

export const getDeleteSpecimensError = (state: State) => state.deleteSpecimensError;

export const getDeleteBarcodesError = (state: State) => state.deleteBarcodesError;

export const getDeleteSpecimensSuccesss = (state: State) => state.deleteSpecimensSuccess;

export const getDeleteBarcodesSuccess = (state: State) => state.deleteBarcodesSuccess;
