import { Action } from '@ngrx/store';
import { Location } from '../models/location';

export const GET_ALL = '[Location] Get All';
export const LOAD_ONE = '[Location] Load One';
export const LOAD_SUCCESS = '[Location] Load Success';
export const DELETE = '[Location] Delete';
export const DELETE_SUCCESS = '[Location] Delete Success';
export const DELETE_FAILURE = '[Location] Delete Failure';
export const CREATE = '[Location] Create';
export const CREATE_FAILURE = '[Location] Create Failure';
export const SELECT = '[Location] Select';
export const UPDATE = '[Location] Update';
export const UPDATE_FAILURE = '[Location] Update Failure';

export class GetAllAction implements Action {
  readonly type = GET_ALL;

  constructor() { }
}

export class LoadOneAction implements Action {
  readonly type = LOAD_ONE;

  constructor(public payload: Location) { }
}

export class LoadSuccessAction implements Action {
  readonly type = LOAD_SUCCESS;

  constructor(public payload: Location[]) { }
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

  constructor(public payload: Location) { }
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

  constructor(public payload: Location) { }
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
