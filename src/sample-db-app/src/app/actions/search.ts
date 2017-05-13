import { Action } from '@ngrx/store';

export const SEARCH_SPECIMENS = '[Search] Specimens';
export const SEARCH_SPECIMENS_FAILURE = '[Search] Specimens Failure';
export const SEARCH_SPECIMENS_SUCCESS = '[Search] Specimens Success';
export const SEARCH_BARCODES = '[Search] Barcodes';
export const SEARCH_BARCODES_FAILURE = '[Search] Barcodes Failure';
export const SEARCH_BARCODES_SUCCESS = '[Search] Barcodes Success';
export const CLEAR_ERRORS = '[Search] Clear Errors';

export class SearchSpecimensAction implements Action {
  readonly type = SEARCH_SPECIMENS;

  constructor(public payload: File) {};
}

export class SearchSpecimensFailureAction implements Action {
  readonly type = SEARCH_SPECIMENS_FAILURE;

  constructor(public payload: string) {};
}

export class SearchSpecimensSuccessAction implements Action {
  readonly type = SEARCH_SPECIMENS_SUCCESS;

  constructor() {};
}

export class SearchBarcodesAction implements Action {
  readonly type = SEARCH_BARCODES;

  constructor(public payload: File) {};
}

export class SearchBarcodesFailureAction implements Action {
  readonly type = SEARCH_BARCODES_FAILURE;

  constructor(public payload: string) {};
}

export class SearchBarcodesSuccessAction implements Action {
  readonly type = SEARCH_BARCODES_SUCCESS;

  constructor() {};
}

export class ClearErrors implements Action {
  readonly type = CLEAR_ERRORS;

  constructor() {};
}

export type Actions
  = SearchSpecimensAction
  | SearchSpecimensFailureAction
  | SearchSpecimensSuccessAction
  | SearchBarcodesAction
  | SearchBarcodesFailureAction
  | SearchBarcodesSuccessAction
  | ClearErrors;
