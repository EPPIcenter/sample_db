import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';
import * as _ from 'underscore';

import * as fromRoot from '../../reducers';
import * as matrixPlate from '../../actions/plate';
import * as location from '../../actions/location';
import { MatrixPlate } from '../../models/plate';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-plate-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle" [buttons]="toolbarButtons" (toggleButton)="dispatchAction($event)">
  </sdb-toolbar>
  <sdb-plate-preview-list [plates]="plates$ | async" [locations]="locations$ | async"></sdb-plate-preview-list>
  `
})
export class MatrixPlateListPageComponent {
  store: Store<fromRoot.State>;
  plates$: Observable<MatrixPlate[]>;
  locations$: Observable<{[id: string]: Location}>;

  toolbarButtons = [
    {
      icon: 'update',
      action: go(['/plate/update']),
      color: 'primary',
      tooltip: 'Update Plates'
    },
    {
      icon: 'add',
      action: go(['/plate/create']),
      color: 'primary',
      tooltip: 'Add New Plate'
    }
  ];
  toolbarColor = 'accent';
  toolbarTitle = 'Plates';

  constructor(store: Store<fromRoot.State>) {
    this.store = store;
    const sortProperty$ = of('location');
    this.locations$ = store.select(fromRoot.getLocationEntities);
    this.plates$ = store.select(fromRoot.getAllMatrixPlates);
    this.plates$ = combineLatest(sortProperty$, this.plates$, (prop, items) => {
      return _.sortBy(items, prop);
    });
    store.dispatch(new location.GetAllAction());
    store.dispatch(new matrixPlate.GetAllAction());
  }

  dispatchAction(action) {
    this.store.dispatch(action);
  }
}
