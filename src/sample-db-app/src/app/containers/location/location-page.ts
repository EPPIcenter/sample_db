import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';
import * as _ from 'underscore';

import * as fromRoot from '../../reducers';
import * as location from '../../actions/location';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-location-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle" [buttons]="toolbarButtons" (toggleButton)="dispatchAction($event)">
  </sdb-toolbar>
  <sdb-location-preview-list [locations]="locations$ | async" (toggleEditButton)="editLocation($event)"></sdb-location-preview-list>
  `
})
export class LocationListPageComponent {
  store: Store<fromRoot.State>;
  locations$: Observable<Location[]>;

  toolbarButtons = [
    {
      icon: 'add',
      action: go(['/location/create']),
      color: 'primary',
      tooltip: 'Add New Location'
    }
  ];
  toolbarColor = 'accent';
  toolbarTitle = 'Locations';

  constructor(store: Store<fromRoot.State>) {
    this.store = store;

    const sortProperty$ = of('description');
    this.locations$ = store.select(fromRoot.getAllLocations);
    this.locations$ = combineLatest(sortProperty$, this.locations$, (prop, items) => {
      return _.sortBy(items, prop);
    });
    store.dispatch(new location.GetAllAction());
  }

  dispatchAction(action) {
    this.store.dispatch(action);
  }

  editLocation(id: string) {
    this.store.dispatch(go(`location/${id}/edit`));
  }


}
