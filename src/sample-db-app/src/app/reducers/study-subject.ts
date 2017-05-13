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
      const newStudySubjects = studySubjects ? studySubjects.filter(studySubject => !state.entities[studySubject.id]) : [];

      const newStudySubjectIds = newStudySubjects.map(studySubject => studySubject.id);
      const newStudySubjectEntities = newStudySubjects.reduce((entities: { [id: string]: StudySubject }, studySubject: StudySubject) => {
        return Object.assign(entities, {
          [studySubject.id]: studySubject
        });
      }, {});

      return {
        ids: [...state.ids, ...newStudySubjectIds],
        entities: Object.assign({}, state.entities, newStudySubjectEntities)
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

    default:
      return state;
  }
}

export const getEntities = (state: State) => state.entities;

export const getIds = (state: State) => state.ids;
