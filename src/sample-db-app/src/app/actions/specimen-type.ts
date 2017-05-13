import { Action } from '@ngrx/store';
import { SpecimenType } from '../models/specimen-type';

export const GET_ALL = '[SpecimenType] Get All';
export const LOAD_ONE = '[SpecimenType] Load One';
export const LOAD_SUCCESS = '[SpecimenType] Load Success';
export const DELETE = '[SpecimenType] Delete';
export const DELETE_SUCCESS = '[SpecimenType] Delete Success';
export const DELETE_FAILURE = '[SpecimenType] Delete Failure';
export const CREATE = '[SpecimenType] Create';
export const CREATE_FAILURE = '[SpecimenType] Create Failure';
export const SELECT = '[SpecimenType] Select';
export const UPDATE = '[SpecimenType] Update';
export const UPDATE_FAILURE = '[SpecimenType] Update Failure';

export class GetAllAction implements Action {
  readonly type = GET_ALL;

  constructor() { }
}

export class LoadOneAction implements Action {
  readonly type = LOAD_ONE;

  constructor(public payload: SpecimenType) { }
}

export class LoadSuccessAction implements Action {
  readonly type = LOAD_SUCCESS;

  constructor(public payload: SpecimenType[]) { }
}

export class DeleteAction implements Action {
  readonly type = DELETE;

  constructor(public payload: string) { }
}

export class DeleteSuccessAction implements Action {
  readonly type = DELETE_SUCCESS;

  constructor(public payload: string) { }
}

export class DeleteFailureAction implements Action {
  readonly type = DELETE_FAILURE;

  constructor(public payload: string) { }
}

export class CreateAction implements Action {
  readonly type = CREATE;

  constructor(public payload: SpecimenType) { }
}

export class CreateFailureAction implements Action {
  readonly type = CREATE_FAILURE;

  constructor(public payload: string) { }
}

export class SelectAction implements Action {
  readonly type = SELECT;

  constructor(public payload: string) { }
}

export class UpdateAction implements Action {
  readonly type = UPDATE;

  constructor(public payload: SpecimenType) { }
}

export class UpdateFailureAction implements Action {
  readonly type = UPDATE_FAILURE;

  constructor(public payload: string) { }
}


export type Actions
  = GetAllAction
  | LoadOneAction
  | LoadSuccessAction
  | DeleteAction
  | DeleteSuccessAction
  | DeleteFailureAction
  | CreateAction
  | CreateFailureAction
  | SelectAction
  | UpdateAction
  | UpdateFailureAction;
