import { createSelector } from 'reselect';
import { ActionReducer, Action } from '@ngrx/store';
import { StudySubject } from '../models/study-subject';
import * as study from '../actions/study';
import * as plate from '../actions/plate';
import * as bulk from '../actions/bulk';

export interface State {
  ids: string[];
  entities: { [id: string]: StudySubject };
};

export const initialState: State = {
  ids: [],
  entities: {}
};

export function reducer(state = initialState, action: study.Actions | plate.Actions | bulk.Actions): State {
  switch (action.type) {
    case study.LOAD_ONE:
    case plate.LOAD_ONE:
      const studySubjects = action.payload.study_subject;

      const newStudySubjectIds = studySubjects.map(studySubject => studySubject.id).filter(id => !state.entities[id]);
      const studySubjectEntities = studySubjects.reduce((entities: { [id: string]: StudySubject }, studySubject: StudySubject) => {
        return Object.assign(entities, {
          [studySubject.id]: studySubject
        });
      }, {});

      return {
        ids: [...state.ids, ...newStudySubjectIds],
        entities: Object.assign({}, state.entities, studySubjectEntities)
      };

    case bulk.DELETE_BARCODES_SUCCESS:
    case bulk.DELETE_SPECIMENS_SUCCESS:
      const deletedSpecimenIds = action.payload.specimenIds;
      const updatedStudySubjectEntities = state.ids.map(id => state.entities[id])
        .reduce((entities: { [id: string]: StudySubject }, studySubject: StudySubject) => {
          const specimenIds = studySubject.specimens.filter(id => deletedSpecimenIds.indexOf(id) === -1);
          const studySubjectWithRemovedIds = Object.assign({}, studySubject, {
            specimens: specimenIds
          });

          return Object.assign(entities, {
            [studySubject.id]: studySubjectWithRemovedIds
          });
        }, {});
      return Object.assign({}, state, {
        entities: updatedStudySubjectEntities
      });

    case study.DELETE_SUBJECT_SUCCESS:
      const deletedStudySubjectId = action.payload;
      const remainingStudySubjectIds = state.ids.filter(id => id !== deletedStudySubjectId);
      const remainingStudySubjectEntities = remainingStudySubjectIds.map(id => state.entities[id])
        .reduce((entities: { [id: string]: StudySubject }, studySubject: StudySubject) => {
          return Object.assign(entities, {
            [studySubject.id]: studySubject
          });
        }, {});
      return {
        ids: remainingStudySubjectIds,
        entities: remainingStudySubjectEntities
      };

    default:
      return state;
  }
}

export const getEntities = (state: State) => state.entities;

export const getIds = (state: State) => state.ids;
