import { Action } from '@ngrx/store';
import { Study, StudyEntry } from '../models/study';


export const GET_ALL = '[Study] Get All';
export const LOAD_ONE = '[Study] Load One';
export const LOAD_SUCCESS = '[Study] Load Success';
export const DELETE = '[Study] Delete';
export const DELETE_SUCCESS = '[Study] Delete Success';
export const DELETE_FAILURE = '[Study] Delete Failure';
export const CREATE = '[Study] Create';
export const CREATE_FAILURE = '[Study] Create Failure';
export const SELECT = '[Study] Select';
export const UPDATE = '[Study] Update';
export const UPDATE_FAILURE = '[Study] Update Failure';
export const ACTIVATE_SUBJECT = '[Study] Activate Subject';
export const DEACTIVATE_SUBJECT = '[Study] Deactivate Subject';

export class GetAllAction implements Action {
  readonly type = GET_ALL;

  constructor() { }
}

export class LoadOneAction implements Action {
  readonly type = LOAD_ONE;

  constructor(public payload: StudyEntry) { }
}

export class LoadSuccessAction implements Action {
  readonly type = LOAD_SUCCESS;

  constructor(public payload: Study[]) { }
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

  constructor(public payload: Study) { }
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

  constructor(public payload: Study) { }
}

export class UpdateFailureAction implements Action {
  readonly type = UPDATE_FAILURE;

  constructor(public payload: string) { }
}

export class ActivateSubjectAction implements Action {
  readonly type = ACTIVATE_SUBJECT;

  constructor(public payload: string) { }
}

export class DeactivateSubjectAction implements Action {
  readonly type = DEACTIVATE_SUBJECT;

  constructor() {}
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
  | UpdateFailureAction
  | ActivateSubjectAction
  | DeactivateSubjectAction;

