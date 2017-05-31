import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import { MatrixTube } from '../models/plate';
import * as study from '../actions/study';
import * as plate from '../actions/plate';
import * as bulk from '../actions/bulk';

export interface State {
  ids: string[];
  entities: { [id: string]: MatrixTube };
};

export const initialState: State = {
  ids: [],
  entities: {}
};

export function reducer(state = initialState, action: study.Actions | plate.Actions | bulk.Actions): State {
  switch (action.type) {
    case study.LOAD_ONE:
    case plate.LOAD_ONE:
      const matrixTubes = action.payload.matrix_tube || [];
      const newMatrixTubes = matrixTubes ? matrixTubes.filter(matrixTube => !state.entities[matrixTube.id]) : [];

      const newMatrixTubeIds = newMatrixTubes.map(matrixTube => matrixTube.id);
      const updatedMatrixTubeEntities =  matrixTubes.reduce((entities: { [id: string]: MatrixTube }, matrixTube: MatrixTube) => {
        return Object.assign(entities, {
          [matrixTube.id]: matrixTube
        });
      }, {});

      return {
        ids: [...state.ids, ...newMatrixTubeIds],
        entities: Object.assign({}, state.entities, updatedMatrixTubeEntities)
      };

    case bulk.DELETE_BARCODES_SUCCESS:
    case bulk.DELETE_SPECIMENS_SUCCESS:
      const deletedMatrixTubeIds = action.payload.matrixTubeIds;
      const notDeletedTubeIds = deletedMatrixTubeIds ? state.ids.filter(id => deletedMatrixTubeIds.indexOf(id) === -1) : [...state.ids];
      const notDeletedTubeEntities = notDeletedTubeIds.map(id => state.entities[id])
        .reduce((entities: { [id: string]: MatrixTube }, matrixTube: MatrixTube) => {
          return Object.assign(entities, {
            [matrixTube.id]: matrixTube
          });
        }, {});

      return {
        ids: notDeletedTubeIds,
        entities: notDeletedTubeEntities
      };

    default:
      return state;
  }
}

export const getEntities = (state: State) => state.entities;

export const getIds = (state: State) => state.ids;

export const getAll = createSelector(getIds, getEntities, (ids, entities) => {
  return ids.map(id => entities[id]);
});
