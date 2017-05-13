import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import { Specimen } from '../models/study-subject';
import * as study from '../actions/study';
import * as plate from '../actions/plate';
import * as bulk from '../actions/bulk';

export interface State {
  ids: string[];
  entities: { [id: string]: Specimen };
};

export const initialState: State = {
  ids: [],
  entities: {}
};

export function reducer(state = initialState, action: study.Actions | plate.Actions | bulk.Actions): State {
  switch (action.type) {
    case study.LOAD_ONE:
    case plate.LOAD_ONE:
      const specimens = action.payload.specimen;
      const newSpecimens = specimens ? specimens.filter(specimen => !state.entities[specimen.id]) : [];

      const newSpecimenIds = newSpecimens.map(specimen => specimen.id);
      const newSpecimenEntities = newSpecimens.reduce((entities: { [id: string]: Specimen }, specimen: Specimen) => {
        return Object.assign(entities, {
          [specimen.id]: specimen
        });
      }, {});

      return {
        ids: [...state.ids, ...newSpecimenIds],
        entities: Object.assign({}, state.entities, newSpecimenEntities)
      };

    case bulk.DELETE_BARCODES_SUCCESS:
    case bulk.DELETE_SPECIMENS_SUCCESS:
      const deletedSpecimenIds = action.payload.specimenIds;
      const notDeletedSpecimenIds = deletedSpecimenIds ? state.ids.filter(id => deletedSpecimenIds.indexOf(id) === -1) : state.ids;
      const notDeletedSpecimenEntities = notDeletedSpecimenIds.map(id => state.entities[id])
        .reduce((entities: { [id: string]: Specimen }, specimen: Specimen) => {
          return Object.assign(entities, {
            [specimen.id]: specimen
          });
        }, {});
      return {
        ids: notDeletedSpecimenIds,
        entities: notDeletedSpecimenEntities
      };

    default:
      return state;
  }
}

export const getEntities = (state: State) => state.entities;

export const getIds = (state: State) => state.ids;
