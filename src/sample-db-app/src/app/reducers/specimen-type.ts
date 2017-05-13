import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import { SpecimenType } from '../models/specimen-type';
import * as specimenType from '../actions/specimen-type';

export interface State {
  deleteError: string | null;
  createError: string | null;
  updateError: string | null;
  ids: string[];
  entities: { [id: string]: SpecimenType };
  selectedSpecimenTypeId: string | null;
};

export const inititalState: State = {
  deleteError: null,
  createError: null,
  updateError: null,
  ids: [],
  entities: {},
  selectedSpecimenTypeId: null,
};

export function reducer(state = inititalState, action: specimenType.Actions): State {
  switch (action.type) {
    case specimenType.LOAD_SUCCESS:
      const specimenTypes = action.payload;
      const newSpecimenTypes = specimenTypes.filter(specimenType => !state.entities[specimenType.id]);

      const newSpecimenTypeIds = newSpecimenTypes.map(specimenType => specimenType.id);
      const newSpecimenTypeEntities = newSpecimenTypes.reduce((entities: { [id: string]: SpecimenType }, specimenType: SpecimenType) => {
        return Object.assign(entities, {
          [specimenType.id]: specimenType
        })
      }, {});

      return {
        deleteError: null,
        createError: null,
        updateError: null,
        ids: [...state.ids, ...newSpecimenTypeIds],
        entities: Object.assign({}, state.entities, newSpecimenTypeEntities),
        selectedSpecimenTypeId: state.selectedSpecimenTypeId
      };
    case specimenType.LOAD_ONE:
      const updatedSpecimenType = action.payload;

      const otherIds = state.ids.filter(id => id !== updatedSpecimenType.id)
      const updatedEntity = {[updatedSpecimenType.id]: updatedSpecimenType}

      return Object.assign({}, state, {
        ids: [...otherIds, updatedSpecimenType.id],
        entities: Object.assign({}, state.entities, updatedEntity),
      });

    case specimenType.DELETE_SUCCESS:
      const deletedId = action.payload;
      const selectedSpecimenTypeId = deletedId === state.selectedSpecimenTypeId ? null : state.selectedSpecimenTypeId
      const notDeletedSpecimenTypeIds = state.ids.filter((id: string) => id !== deletedId);
      const notDeletedSpecimenTypes = notDeletedSpecimenTypeIds.map(id => state.entities[id]);

      const notDeletedSpecimenTypeEntities = notDeletedSpecimenTypes.reduce((entities: { [id: string]: SpecimenType },
        specimenType: SpecimenType) => {
          return Object.assign(entities, {
            [specimenType.id]: specimenType
          });
        }, {});

      return Object.assign({}, state, {
        deleteError: null,
        ids: notDeletedSpecimenTypeIds,
        entities: notDeletedSpecimenTypeEntities,
        selectedSpecimenTypeId: selectedSpecimenTypeId
      });

    case specimenType.DELETE_FAILURE:
      const deleteError = action.payload;

      return Object.assign({}, state, {deleteError: deleteError});

    case specimenType.CREATE_FAILURE:
      const createError = action.payload;

      return Object.assign({}, state, {createError: createError});

    case specimenType.UPDATE_FAILURE:
      const updateError = action.payload;

      return Object.assign({}, state, {updateError: updateError});

    case specimenType.SELECT:
      const id = action.payload;

      return Object.assign({}, state, {selectedSpecimenTypeId: id});

    default:
      return state;
  }
}


export const getEntities = (state: State) => state.entities;

export const getIds = (state: State) => state.ids;

export const getSelectedId = (state: State) => state.selectedSpecimenTypeId;

export const getCreateError = (state: State) => state.createError;

export const getDeleteError = (state: State) => state.deleteError;

export const getUpdateError = (state: State) => state.updateError;

export const getSelected = createSelector(getEntities, getSelectedId, (entities, selectedId) => {
  return entities[selectedId];
});

export const getSelectedLabel = createSelector(getSelected, (selected) => {
  return selected ? selected.label : undefined;
});

export const getAll = createSelector(getEntities, getIds, (entities, ids) => {
  return ids.map(id => entities[id]);
});
