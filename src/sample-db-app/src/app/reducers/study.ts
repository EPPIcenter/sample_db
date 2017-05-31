import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import { Study } from '../models/study';
import { StudySubject } from '../models/study-subject';
import * as study from '../actions/study';
import * as plate from '../actions/plate';

export interface State {
  deleteError: string | null;
  deleteSubjectError: string | null;
  createError: string | null;
  updateError: string | null;
  ids: string[];
  entities: { [id: string]: Study };
  selectedStudyId: string | null;
  activeSubjectId: string | null;
};

export const inititalState: State = {
  deleteError: null,
  deleteSubjectError: null,
  createError: null,
  updateError: null,
  ids: [],
  entities: {},
  selectedStudyId: null,
  activeSubjectId: null
};

export function reducer(state = inititalState, action: study.Actions | plate.Actions): State {
  switch (action.type) {
    case study.LOAD_SUCCESS:
      const studies = action.payload;
      const newStudies = studies.filter(study => !state.entities[study.id]);

      const newStudyIds = newStudies.map(study => study.id);
      const newStudyEntities = newStudies.reduce((entities: { [id: string]: Study }, study: Study) => {
        return Object.assign(entities, {
          [study.id]: study
        });
      }, {});

      return {
        deleteError: null,
        deleteSubjectError: null,
        createError: null,
        updateError: null,
        ids: [ ...state.ids, ...newStudyIds ],
        entities: Object.assign({}, state.entities, newStudyEntities),
        selectedStudyId: state.selectedStudyId,
        activeSubjectId: null
      };

    case study.LOAD_ONE:
      const updatedStudy = action.payload.study;

      const otherIds = state.ids.filter(id => id !== updatedStudy.id);
      const updatedEntity = {[updatedStudy.id]: updatedStudy};

      return Object.assign({}, state, {
        ids: [...otherIds, updatedStudy.id],
        entities: Object.assign({}, state.entities, updatedEntity),
      });

    case study.DELETE_SUCCESS:
      const deletedId = action.payload;
      const notDeletedStudyIds = state.ids.filter((id: string) => id !== deletedId);
      const notDeletedStudies = notDeletedStudyIds.map(id => state.entities[id]);

      const notDeletedStudyEntities = notDeletedStudies.reduce((entities: { [id: string]: Study }, study: Study) => {
        return Object.assign(entities, {
          [study.id]: study
        });
      }, {});

      return {
        deleteError: null,
        deleteSubjectError: state.deleteSubjectError,
        createError: state.createError,
        updateError: state.updateError,
        ids: notDeletedStudyIds,
        entities: notDeletedStudyEntities,
        selectedStudyId: state.selectedStudyId,
        activeSubjectId: null
      };

    case study.DELETE_FAILURE:
      const deleteError = action.payload;

      return Object.assign({}, state, {deleteError: deleteError});

    case study.CREATE_FAILURE:
      const createError = action.payload;

      return Object.assign({}, state, {createError: createError});

    case study.UPDATE_FAILURE:
      const updateError = action.payload;

      return Object.assign({}, state, {updateError: updateError});

    case study.SELECT:
      const id = action.payload;

      return Object.assign({}, state, {selectedStudyId: id});

    case study.ACTIVATE_SUBJECT:
      const subjectId = action.payload;

      return Object.assign({}, state, {
        activeSubjectId: subjectId,
        deleteSubjectError: null
      });

    case study.DEACTIVATE_SUBJECT:
      return Object.assign({}, state, {activeSubjectId: null});

    case study.DELETE_SUBJECT_SUCCESS:
      const deletedSubjectId = action.payload;

      const updatedStudies = state.ids.map(studyId => state.entities[studyId])
        .map(study => {
          const subjects = study.subjects.filter(subjectId => subjectId !== deletedSubjectId);
          return Object.assign({}, study, {subjects: subjects});
        });

      const updatedStudyEntities = updatedStudies.reduce((entities: { [id: string]: Study }, study:  Study) => {
        return Object.assign(entities, {
          [study.id]: study
        });
      }, {});

      return Object.assign({}, state, {
        deleteSubjectError: null,
        entities: updatedStudyEntities,
        activeSubjectId: null
      });

    case study.DELETE_SUBJECT_FAILURE:
      const deleteSubjectError = action.payload;

      return Object.assign({}, state, {deleteSubjectError: deleteSubjectError});

    case plate.LOAD_ONE:
      const newStudySubjects = action.payload.study_subject;
      const groupedByStudy = newStudySubjects.reduce((byStudy: { [id: string]: string[] }, studySubject: StudySubject) => {
        const oldIds = byStudy[studySubject.study] || [];
        return Object.assign(byStudy, {
          [studySubject.study]: [...oldIds, studySubject.id]
        });
      }, {});
      const oldStudies = state.ids.map(id => state.entities[id]);
      const updatedStudySubjectStudyEntities = oldStudies.reduce((entities: { [id: string]: Study }, study: Study) => {
        const newStudySubjectIdsForStudy = groupedByStudy[study.id].filter(studySubjectId => study.subjects.indexOf(studySubjectId) === -1);
        const updatedStudySubjectStudy = Object.assign({}, study, {subjects: [...study.subjects, ...newStudySubjectIdsForStudy]});
        return Object.assign(entities, {
          [study.id]: updatedStudySubjectStudy
        });
      }, {});
      return Object.assign({}, state, {entities: updatedStudySubjectStudyEntities});

    default:
      return state;
  }
};


export const getEntities = (state: State) => state.entities;

export const getIds = (state: State) => state.ids;

export const getSelectedId = (state: State) => state.selectedStudyId;

export const getCreateError = (state: State) => state.createError;

export const getDeleteError = (state: State) => state.deleteError;

export const getDeleteSubjectError = (state: State) => state.deleteSubjectError;

export const getUpdateError = (state: State) => state.updateError;

export const getActiveSubjectId = (state: State) => state.activeSubjectId;

export const getSelected = createSelector(getEntities, getSelectedId, (entities, selectedId) => {
  return entities[selectedId];
});

export const getSelectedTitle = createSelector(getSelected, (selected) => {
  return selected ? selected.title : undefined;
});

export const getSelectedSubjectIds = createSelector(getSelected, (selected) => {
  return selected ? selected.subjects : [];
});

export const getAll = createSelector(getEntities, getIds, (entities, ids) => {
  return ids.map(id => entities[id]);
});
