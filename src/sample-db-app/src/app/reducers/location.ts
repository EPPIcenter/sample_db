import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import { Location } from '../models/location';
import * as location from '../actions/location';

export interface State {
  deleteError: string | null;
  createError: string | null;
  updateError: string | null;
  ids: string[];
  entities: { [id: string]: Location };
  selectedLocationId: string | null;
};

export const inititalState: State = {
  deleteError: null,
  createError: null,
  updateError: null,
  ids: [],
  entities: {},
  selectedLocationId: null,
};

export function reducer(state = inititalState, action: location.Actions): State {
  switch (action.type) {
    case location.LOAD_SUCCESS:
      const locations = action.payload;
      const newLocations = locations.filter(location => !state.entities[location.id]);

      const newLocationIds = newLocations.map(location => location.id);
      const newLocationEntities = newLocations.reduce((entities: { [id: string]: Location }, location: Location) => {
        return Object.assign(entities, {
          [location.id]: location
        })
      }, {});

      return {
        deleteError: null,
        createError: null,
        updateError: null,
        ids: [...state.ids, ...newLocationIds],
        entities: Object.assign({}, state.entities, newLocationEntities),
        selectedLocationId: state.selectedLocationId
      };

    case location.LOAD_ONE:
      const updatedLocation = action.payload;

      const otherIds = state.ids.filter(id => id !== updatedLocation.id)
      const updatedEntity = {[updatedLocation.id]: updatedLocation};

      return Object.assign({}, state, {
        ids: [...otherIds, updatedLocation.id],
        entities: Object.assign({}, state.entities, updatedEntity),
      });

    case location.DELETE_SUCCESS:
      const deletedId = action.payload;
      const notDeletedLocationIds = state.ids.filter((id: string) => id !== deletedId);
      const notDeletedLocations = notDeletedLocationIds.map(id => state.entities[id]);

      const notDeletedLocationEntities = notDeletedLocations.reduce((entities: { [id: string]: Location }, location: Location) => {
        return Object.assign(entities, {
          [location.id]: location
        });
      }, {});

      return Object.assign({}, state, {
        deleteError: null,
        ids: notDeletedLocationIds,
        entities: notDeletedLocationEntities
      });

    case location.DELETE_FAILURE:
      const deleteError = action.payload;

      return Object.assign({}, state, {deleteError: deleteError});

    case location.CREATE_FAILURE:
      const createError = action.payload;

      return Object.assign({}, state, {createError: createError});

    case location.UPDATE_FAILURE:
      const updateError = action.payload;

      return Object.assign({}, state, {updateError: updateError});

    case location.SELECT:
      const id = action.payload;

      return Object.assign({}, state, {selectedLocationId: id});

    default:
      return state;
  }
}


export const getEntities = (state: State) => state.entities;

export const getIds = (state: State) => state.ids;

export const getSelectedId = (state: State) => state.selectedLocationId;

export const getCreateError = (state: State) => state.createError;

export const getDeleteError = (state: State) => state.deleteError;

export const getUpdateError = (state: State) => state.updateError;

export const getSelected = createSelector(getEntities, getSelectedId, (entities, selectedId) => {
  return entities[selectedId];
});

export const getSelectedDescription = createSelector(getSelected, (selected) => {
  return selected ? selected.description : undefined;
});

export const getAll = createSelector(getEntities, getIds, (entities, ids) => {
  return ids.map(id => entities[id]);
});
