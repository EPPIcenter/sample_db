import { Action } from '@ngrx/store';
import { DeleteQuery } from '../services/bulk';

export const DELETE_SPECIMENS = '[Bulk] Delete Specimens';
export const DELETE_SPECIMENS_FAILURE = '[Bulk] Delete Specimens Failure';
export const DELETE_SPECIMENS_SUCCESS = '[Bulk] Delete Specimens Success';
export const DELETE_BARCODES = '[Bulk] Delete Barcodes';
export const DELETE_BARCODES_FAILURE = '[Bulk] Delete Barcodes Failure';
export const DELETE_BARCODES_SUCCESS = '[Bulk] Delete Barcodes Success';
export const CLEAR_ERRORS = '[Bulk] Clear Errors';

export class DeleteSpecimensAction implements Action {
  readonly type = DELETE_SPECIMENS;

  constructor(public payload: File) {}
}

export class DeleteSpecimensFailureAction implements Action {
  readonly type = DELETE_SPECIMENS_FAILURE;

  constructor(public payload: string) {}
}

export class DeleteSpecimensSuccessAction implements Action {
  readonly type = DELETE_SPECIMENS_SUCCESS;

  constructor(public payload: DeleteQuery) {}
}

export class DeleteBarcodesAction implements Action {
  readonly type = DELETE_BARCODES;

  constructor(public payload: File) {}
}

export class DeleteBarcodesFailureAction implements Action {
  readonly type = DELETE_BARCODES_FAILURE;

  constructor(public payload: string) {}
}

export class DeleteBarcodesSuccessAction implements Action {
  readonly type = DELETE_BARCODES_SUCCESS;

  constructor(public payload: DeleteQuery) {}
}

export class ClearErrors implements Action {
  readonly type = CLEAR_ERRORS;

  constructor() {};
}

export type Actions
 = DeleteSpecimensAction
 | DeleteSpecimensFailureAction
 | DeleteSpecimensSuccessAction
 | DeleteBarcodesAction
 | DeleteBarcodesFailureAction
 | DeleteBarcodesSuccessAction
 | ClearErrors;

