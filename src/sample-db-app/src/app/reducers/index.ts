import { createSelector } from 'reselect';
import { ActionReducer } from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import { environment } from '../../environments/environment';
import { compose } from '@ngrx/core/compose';
import { storeFreeze } from 'ngrx-store-freeze';
import { combineReducers } from '@ngrx/store';

import * as fromLayout from './layout';
import * as fromStudy from './study';
import * as fromStudySubject from './study-subject';
import * as fromSpecimen from './specimen';
import * as fromLocation from './location';
import * as fromSpecimenType from './specimen-type';
import * as fromMatrixPlate from './plate';
import * as fromMatrixTube from './matrix-tube';
import * as fromSearch from './search';
import * as fromBulk from './bulk';

import { StudySubject, Specimen } from '../models/study-subject';
import { MatrixTube } from '../models/plate';


export interface State {
  layout: fromLayout.State;
  study: fromStudy.State;
  location: fromLocation.State;
  specimenType: fromSpecimenType.State;
  studySubject: fromStudySubject.State;
  specimen: fromSpecimen.State;
  matrixPlate: fromMatrixPlate.State;
  matrixTube: fromMatrixTube.State;
  search: fromSearch.State;
  bulk: fromBulk.State;
}

const reducers = {
  layout: fromLayout.reducer,
  study: fromStudy.reducer,
  location: fromLocation.reducer,
  specimenType: fromSpecimenType.reducer,
  studySubject: fromStudySubject.reducer,
  specimen: fromSpecimen.reducer,
  matrixPlate: fromMatrixPlate.reducer,
  matrixTube: fromMatrixTube.reducer,
  search: fromSearch.reducer,
  bulk: fromBulk.reducer
};

const developmentReducer: ActionReducer<State> = compose(storeFreeze, combineReducers)(reducers);
const productionReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}

// Study Subject State
export const getStudySubjectState = (state: State) => state.studySubject;

export const getStudySubjectEntities = createSelector(getStudySubjectState, fromStudySubject.getEntities);
export const getStudySubjectIds = createSelector(getStudySubjectState, fromStudySubject.getIds);

// Specimen State
export const getSpecimenState = (state: State) => state.specimen;

export const getSpecimenEntities = createSelector(getSpecimenState, fromSpecimen.getEntities);
export const getSpecimenIds = createSelector(getSpecimenState, fromSpecimen.getIds);

// Matrix Tube State
export const getMatrixTubeState = (state: State) => state.matrixTube;

export const getMatrixTubeEntities = createSelector(getMatrixTubeState, fromMatrixTube.getEntities);
export const getMatrixTubeIds = createSelector(getMatrixTubeState, fromMatrixTube.getIds);
export const getAllMatrixTubes = createSelector(getMatrixTubeState, fromMatrixTube.getAll);

// Study State
export const getStudyState = (state: State) => state.study;

export const getStudyEntities = createSelector(getStudyState, fromStudy.getEntities);
export const getStudyIds = createSelector(getStudyState, fromStudy.getIds);
export const getSelectedStudyId = createSelector(getStudyState, fromStudy.getSelectedId);
export const getSelectedStudy = createSelector(getStudyState, fromStudy.getSelected);
export const getSelectedStudyTitle = createSelector(getStudyState, fromStudy.getSelectedTitle);
export const getSelectedStudySubjectIds = createSelector(getStudyState, fromStudy.getSelectedSubjectIds);
export const getAllStudies = createSelector(getStudyState, fromStudy.getAll);
export const getCreateStudyError = createSelector(getStudyState, fromStudy.getCreateError);
export const getDeleteStudyError = createSelector(getStudyState, fromStudy.getDeleteError);
export const getUpdateStudyError = createSelector(getStudyState, fromStudy.getUpdateError);
export const getActivatedStudySubjectId = createSelector(getStudyState, fromStudy.getActiveSubjectId);
export const getActivatedStudySubject = createSelector(getActivatedStudySubjectId, getStudySubjectEntities, (id, entities) => {
  return entities[id];
});

export const getSelectedStudySubjects = createSelector(getSelectedStudySubjectIds, getStudySubjectEntities, (ids, entities) => {
  return ids.map((id: string) => entities[id]);
});

export const getSelectedStudySpecimens = createSelector(getSelectedStudySubjects, getSpecimenEntities, (subjects, specimens) => {
  const specimenIds = subjects.reduce((ids: string[], subject) => {
    return [...ids, ...subject.specimens];
  }, []);
  return specimenIds.reduce((specimenEntities: { [id: string]: Specimen }, id: string) => {
    return Object.assign(specimenEntities, {
      [id]: specimens[id]
    });
  }, {});
});

export const getActivatedStudySubjectSpecimens = createSelector(getActivatedStudySubject, getSpecimenEntities, (studySubject, entities) => {
  if (studySubject) {
    return studySubject.specimens.reduce((specimenEntities: { [id: string]: Specimen}, id: string) => {
      return Object.assign(specimenEntities, {
        [id]: entities[id]
      });
    }, {});
  } else {
    return undefined;
  }
});

export const getActivatedStudySubjectMatrixTubes = createSelector(getActivatedStudySubjectSpecimens,
  getAllMatrixTubes, (specimens, matrixTubes) => {
    if (specimens) {
      return matrixTubes.filter((tube) => {
        return Object.keys(specimens).indexOf(tube.specimen) !== -1;
      });
    } else {
      return undefined;
    }
});


// Layout State
export const getLayoutState = (state: State) => state.layout;

export const getShowSidenav = createSelector(getLayoutState, fromLayout.getShowSidenav);


// Location State
export const getLocationState = (state: State) => state.location;

export const getLocationEntities = createSelector(getLocationState, fromLocation.getEntities);
export const getLocationIds = createSelector(getLocationState, fromLocation.getIds);
export const getSelectedLocationId = createSelector(getLocationState, fromLocation.getSelectedId);
export const getSelectedLocation = createSelector(getLocationState, fromLocation.getSelected);
export const getSelectedLocationDescription = createSelector(getLocationState, fromLocation.getSelectedDescription);
export const getAllLocations = createSelector(getLocationState, fromLocation.getAll);
export const getCreateLocationError = createSelector(getLocationState, fromLocation.getCreateError);
export const getDeleteLocationError = createSelector(getLocationState, fromLocation.getDeleteError);
export const getUpdateLocationError = createSelector(getLocationState, fromLocation.getUpdateError);


// Specimen Type State
export const getSpecimenTypeState = (state: State) => state.specimenType;

export const getSpecimenTypeEntities = createSelector(getSpecimenTypeState, fromSpecimenType.getEntities);
export const getSpecimenTypeIds = createSelector(getSpecimenTypeState, fromSpecimenType.getIds);
export const getSelectedSpecimenTypeId = createSelector(getSpecimenTypeState, fromSpecimenType.getSelectedId);
export const getSelectedSpecimenType = createSelector(getSpecimenTypeState, fromSpecimenType.getSelected);
export const getSelectedSpecimenTypeLabel = createSelector(getSpecimenTypeState, fromSpecimenType.getSelectedLabel);
export const getAllSpecimenTypes = createSelector(getSpecimenTypeState, fromSpecimenType.getAll);
export const getCreateSpecimenTypeError = createSelector(getSpecimenTypeState, fromSpecimenType.getCreateError);
export const getDeleteSpecimenTypeError = createSelector(getSpecimenTypeState, fromSpecimenType.getDeleteError);
export const getUpdateSpecimenTypeError = createSelector(getSpecimenTypeState, fromSpecimenType.getUpdateError);


// Matrix Plate State
export const getMatrixPlateState = (state: State) => state.matrixPlate;

export const getMatrixPlateEntities = createSelector(getMatrixPlateState, fromMatrixPlate.getEntities);
export const getMatrixPlateIds = createSelector(getMatrixPlateState, fromMatrixPlate.getIds);
export const getSelectedMatrixPlateId = createSelector(getMatrixPlateState, fromMatrixPlate.getSelectedId)
export const getSelectedMatrixPlate = createSelector(getMatrixPlateState, fromMatrixPlate.getSelected);
// export const getSelectedMatrixPlateStudySubjects = createSelector(getMatrixPlateState, fromMatrixPlate.getSelectedSubjectIds);
export const getSelectedMatrixPlateLocation = createSelector(getSelectedMatrixPlate, getLocationEntities, (plate, locations) => {
  return plate ? locations[plate.location] : undefined;
});
export const getAllMatrixPlates = createSelector(getMatrixPlateState, fromMatrixPlate.getAll);
export const getUpdateMatrixPlateError = createSelector(getMatrixPlateState, fromMatrixPlate.getUpdateError);
export const getUploadMatrixPlateError = createSelector(getMatrixPlateState, fromMatrixPlate.getUploadError);
export const getDeleteMatrixPlateError = createSelector(getMatrixPlateState, fromMatrixPlate.getDeleteError);
export const getSelectedMatrixPlateTubes = createSelector(getSelectedMatrixPlate, getMatrixTubeEntities, (plate, tubes) => {
  return plate.tubes.map(tubeId => tubes[tubeId])
});

export const getSelectedMatrixPlateSpecimens = createSelector(getSelectedMatrixPlateTubes, getSpecimenEntities, (tubes, entities) => {
  if (tubes) {
    return tubes.reduce((specimenEntities: {[id: string]: Specimen}, tube: MatrixTube) => {
      return Object.assign(specimenEntities, {
        [tube.specimen]: entities[tube.specimen]
      });
    }, {});
  } else {
    return undefined;
  }
});

export const getSelectedMatrixPlateStudySubjects = createSelector(getSelectedMatrixPlateSpecimens, getStudySubjectEntities,
  (specimens, entities) => {
    if (specimens) {
      return Object.keys(specimens).reduce((studySubjectEntities: {[id: string]: StudySubject}, specimenId: string) => {
        return Object.assign(studySubjectEntities, {
          [specimens[specimenId].study_subject]: entities[specimens[specimenId].study_subject]
        });
      }, {});
    } else {
      return undefined;
    }
});

// Search State
export const getSearchState = (state: State) => state.search;

export const getSearchSpecimensError = createSelector(getSearchState, fromSearch.getSearchSpecimensError);
export const getSearchBarcodesError = createSelector(getSearchState, fromSearch.getSearchBarcodesError);

// Bulk State
export const getBulkState = (state: State) => state.bulk;

export const getBulkDeleteSpecimensError = createSelector(getBulkState, fromBulk.getDeleteSpecimensError);
export const getBulkDeleteBarcodesError = createSelector(getBulkState, fromBulk.getDeleteBarcodesError);
export const getBulkDeleteSpecimensSuccess = createSelector(getBulkState, fromBulk.getDeleteSpecimensSuccesss);
export const getBulkDeleteBarcodesSuccess = createSelector(getBulkState, fromBulk.getDeleteBarcodesSuccess);
