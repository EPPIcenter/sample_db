import { Action } from '@ngrx/store';

export const OPEN_SIDENAV =   '[Layout] Open Sidenav';
export const CLOSE_SIDENAV =  '[Layout] Close Sidenav';
export const TOGGLE_SIDENAV = '[Layout] Toggle Sidenav';


export class OpenSidenavAction implements Action {
  readonly type = OPEN_SIDENAV;
}

export class CloseSidenavAction implements Action {
  readonly type = CLOSE_SIDENAV;
}

export class ToggleSidenavAction implements Action {
  readonly type = TOGGLE_SIDENAV;
}


export type Actions
  = OpenSidenavAction
  | CloseSidenavAction
  | ToggleSidenavAction;
