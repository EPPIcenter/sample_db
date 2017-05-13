import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import { MatrixPlate } from '../models/plate';
import * as matrixPlate from '../actions/plate';
import * as bulk from '../actions/bulk';

export interface State {
  deleteError: string | null;
  uploadError: string | null;
  updateError: string | null;
  ids: string[];
  entities: { [id: string]: MatrixPlate };
  selectedPlateId: string | null;
}

export const initialState: State = {
  deleteError: null,
  uploadError: null,
  updateError: null,
  ids: [],
  entities: {},
  selectedPlateId: null
};

export function reducer(state = initialState, action: matrixPlate.Actions | bulk.Actions): State {
  switch (action.type) {
    case matrixPlate.LOAD_SUCCESS:
      const plates = action.payload;
      const newPlates = plates.filter(plate => !state.entities[plate.id]);

      const newPlateIds = newPlates.map(plate => plate.id);
      const newPlateEntities = newPlates.reduce((entities: { [id: string]: MatrixPlate }, plate: MatrixPlate) => {
        return Object.assign(entities, {
          [plate.id]: plate
        });
      }, {});

      return Object.assign({}, state, {
        deleteError: null,
        uploadError: null,
        updateError: null,
        ids: [ ...state.ids, ...newPlateIds ],
        entities: Object.assign({}, state.entities, newPlateEntities),
      });

    case matrixPlate.LOAD_ONE:
      const updatedPlate = action.payload.matrix_plate;
      let updatedIds: string[];
      let otherIds: string[];
      let updatedEntities: {[id: string]: MatrixPlate};

      if (Array.isArray(updatedPlate)) {
        updatedIds = updatedPlate.map(p => p.id);
        otherIds = state.ids.filter(id => updatedIds.indexOf(id) === -1);
        updatedEntities = updatedPlate.reduce((entities: { [id: string]: MatrixPlate }, plate: MatrixPlate) => {
          return Object.assign(entities, {
            [plate.id]: plate
          });
        }, {});
      } else {
        updatedIds = [updatedPlate.id];
        otherIds = state.ids.filter(id => id !== updatedPlate.id);
        updatedEntities = {[updatedPlate.id]: updatedPlate};
      }

      return Object.assign({}, state, {
        ids: [...otherIds, ...updatedIds],
        entities: Object.assign({}, state.entities, updatedEntities)
      });

    case matrixPlate.DELETE_SUCCESS:
      const deletedId = action.payload;
      const notDeletedPlateIds = state.ids.filter((id: string) => id !== deletedId);
      const notDeletedPlates = notDeletedPlateIds.map(id => state.entities[id]);

      const notDeletedPlateEntities = notDeletedPlates.reduce((entities: { [id: string]: MatrixPlate }, plate: MatrixPlate) => {
        return Object.assign(entities, {
          [plate.id]: plate
        });
      }, {});

      return Object.assign({}, state, {
        deleteError: null,
        ids: notDeletedPlateIds,
        entities: notDeletedPlateEntities
      });

    case matrixPlate.DELETE_FAILURE:
      const deleteError = action.payload;

      return Object.assign({}, state, {deleteError: deleteError});

    case matrixPlate.UPDATE_FAILURE:
      const updateError = action.payload;

      return Object.assign({}, state, {updateError: updateError});

    case matrixPlate.UPLOAD_FAILURE:
      const uploadError = action.payload;

      return Object.assign({}, state, {uploadError: uploadError});

    case matrixPlate.SELECT:
      const selectedId = action.payload;

      return Object.assign({}, state, {selectedPlateId: selectedId});

    case bulk.DELETE_BARCODES_SUCCESS:
    case bulk.DELETE_SPECIMENS_SUCCESS:
      const deletedTubeIds = action.payload.matrixTubeIds;
      const updatedMatrixPlateEntities = state.ids.map(id => state.entities[id])
        .reduce((entities: { [id: string]: MatrixPlate }, plate: MatrixPlate) => {
          const tubeIds = plate.tubes.filter(id => {
            return deletedTubeIds.indexOf(id) === -1;
          });

          const plateWithRemovedIds = Object.assign({}, plate, {
            tubes: tubeIds
          });

          return Object.assign(entities, {
            [plate.id]: plateWithRemovedIds
          });
        }, {});

      return Object.assign({}, state, {
        entities: updatedMatrixPlateEntities
      });

    default:
      return state;
  }
};

export const getEntities = (state: State) => state.entities;

export const getIds = (state: State) => state.ids;

export const getSelectedId = (state: State) => state.selectedPlateId;

export const getDeleteError = (state: State) => state.deleteError;

export const getUpdateError = (state: State) => state.updateError;

export const getUploadError = (state: State) => state.uploadError;

export const getSelected = createSelector(getEntities, getSelectedId, (entities, selectedId) => {
  return entities[selectedId];
});

export const getAll = createSelector(getEntities, getIds, (entities, ids) => {
  return ids.map(id => entities[id]);
});


