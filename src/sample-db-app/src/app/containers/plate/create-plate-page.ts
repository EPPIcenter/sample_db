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
import * as study from '../../actions/study';
import { MatrixPlate } from '../../models/plate';
import { Location } from '../../models/location';
import { Study } from '../../models/study';

@Component({
  selector: 'sdb-create-plate-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle"></sdb-toolbar>
  <sdb-plate-upload-form [error]="createPlateError$ | async" [locations]="locations$ | async"
  (submitButton)="submitPlate($event)" (cancelButton)="cancelSubmitPlate()">
  </sdb-plate-upload-form>
  `
})
export class CreateMatrixPlatePageComponent {
  store: Store<fromRoot.State>;
  createPlateError$: Observable<string>;
  locations$: Observable<Location[]>;
  toolbarColor = 'accent';
  toolbarTitle = 'Upload New Plate';

  constructor(store: Store<fromRoot.State>) {
    this.store = store;
    this.createPlateError$ = store.select(fromRoot.getUploadMatrixPlateError);
    this.locations$ = store.select(fromRoot.getAllLocations);
    this.locations$ = combineLatest(of('description'), this.locations$, (prop, items) => {
      return _.sortBy(items, prop);
    });
    store.dispatch(new location.GetAllAction());
  }

  submitPlate(e) {
    this.store.dispatch(new matrixPlate.UploadAction(e));
  }

  cancelSubmitPlate() {
    this.store.dispatch(go('/plate'));
  }

}
