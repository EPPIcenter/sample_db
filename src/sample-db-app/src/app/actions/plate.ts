import { Action } from '@ngrx/store';
import { MatrixPlate, MatrixPlateEntry } from '../models/plate';


export const GET_ALL = '[Plate] Get All';
export const LOAD_ONE = '[Plate] Load One';
export const LOAD_SUCCESS = '[Plate] Load Success';
export const DELETE = '[Plate] Delete';
export const DELETE_SUCCESS = '[Plate] Delete Success';
export const DELETE_FAILURE = '[Plate] Delete Failure';
export const UPLOAD = '[Plate] Upload';
export const UPLOAD_FAILURE = '[Plate] Upload Failure';
export const UPDATE = '[Plate] Update';
export const UPDATE_FAILURE = '[Plate] Update Failure';
export const SELECT = '[Plate] Select';

export class GetAllAction implements Action {
  readonly type = GET_ALL;

  constructor() { }
}

export class LoadOneAction implements Action {
  readonly type = LOAD_ONE;

  constructor(public payload: MatrixPlateEntry) { }
}

export class LoadSuccessAction implements Action {
  readonly type = LOAD_SUCCESS;

  constructor(public payload: MatrixPlate[]) { }
}

export class DeleteAction implements Action {
  readonly type = DELETE;

  constructor(public payload: string) { }
}

export class DeleteSuccessAction implements Action {
  readonly type = DELETE_SUCCESS;

  constructor(public payload: string) { }
}

export class DeleteFailureAction implements  Action {
  readonly type = DELETE_FAILURE;

  constructor(public payload: string) { }
}

export class UploadAction implements Action {
  readonly type = UPLOAD;

  constructor(public payload: {
    file: File,
    plate_uid: string,
    location_id: string
  }) { }
}

export class UploadFailureAction implements Action {
  readonly type = UPLOAD_FAILURE;

  constructor(public payload: string) { }
}

export class UpdateAction implements Action {
  readonly type = UPDATE;

  constructor(public payload: File[]) { }
}

export class UpdateFailureAction implements Action {
  readonly type = UPDATE_FAILURE;

  constructor(public payload: string) { }
}

export class SelectAction implements Action {
  readonly type = SELECT;

  constructor(public payload: string) { }
}

export type Actions
  = GetAllAction
  | LoadOneAction
  | LoadSuccessAction
  | DeleteAction
  | DeleteSuccessAction
  | DeleteFailureAction
  | UploadAction
  | UploadFailureAction
  | UpdateAction
  | UpdateFailureAction
  | SelectAction;
