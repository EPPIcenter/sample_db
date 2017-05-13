import * as layout from '../actions/layout';

export interface State {
  showSidenav: boolean;
}

const initialState: State = {
  showSidenav: false,
};

export function reducer(state = initialState, action: layout.Actions): State {
  switch (action.type) {
    case layout.CLOSE_SIDENAV:
      return {
        showSidenav: false
      };

    case layout.OPEN_SIDENAV:
      return {
        showSidenav: true
      };

    case layout.TOGGLE_SIDENAV:
      return {
        showSidenav: !state.showSidenav
      };

    default:
      return state;
  }
}

export const getShowSidenav = (state: State) => state.showSidenav;
