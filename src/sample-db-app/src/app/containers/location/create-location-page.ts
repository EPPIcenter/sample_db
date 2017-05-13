import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as location from '../../actions/location';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-create-location-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle"></sdb-toolbar>
  <sdb-location-form [error]="createLocationError$ | async" [(location)]="newLocation"
    (submitButton)="submitLocation()" (cancelButton)="cancelSubmitLocation()">
  </sdb-location-form>
  `
})
export class CreateLocationPageComponent {
  store: Store<fromRoot.State>;
  createLocationError$: Observable<string>;
  newLocation: Location;
  toolbarColor = 'accent';
  toolbarTitle = 'Register New Location';

  constructor(store:  Store<fromRoot.State>) {
    this.store = store;
    this.createLocationError$ = store.select(fromRoot.getCreateLocationError);
    this.newLocation = {
      id: null,
      created: null,
      last_updated: null,
      description: null
    };
  }

  submitLocation() {
    this.store.dispatch(new location.CreateAction(this.newLocation));
    this.newLocation = Object.assign({}, this.newLocation);
  }

  cancelSubmitLocation() {
    this.store.dispatch(go('/location'));
  }
}
