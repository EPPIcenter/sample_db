import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as matrixPlate from '../../actions/plate';
import { MatrixPlateService } from '../../services/plate';

@Component({
  selector: 'sdb-update-plates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:`
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle"></sdb-toolbar>
  <sdb-plate-update-form [error]="updatePlateError$ | async" (submitButton)="submitPlates($event)" (cancelButton)="cancelSubmitPlates()">
  </sdb-plate-update-form>
  `
})
export class UpdateMatrixPlatePageComponent {
  store: Store<fromRoot.State>;
  updatePlateError$: Observable<string>;
  matrixPlateService: MatrixPlateService;
  toolbarColor = 'accent';
  toolbarTitle = 'Update Plates';

  constructor(store: Store<fromRoot.State>, matrixPlateService: MatrixPlateService) {
    this.store = store;
    this.updatePlateError$ = store.select(fromRoot.getUpdateMatrixPlateError);
  }

  submitPlates(plates: FileList) {
    const plate_list = []
    for (let i = 0; i < plates.length; i++) {
      plate_list.push(plates[i]);
    }
    this.store.dispatch(new matrixPlate.UpdateAction(plate_list));
  };

  cancelSubmitPlates() {
    this.store.dispatch(go('/plate'));
  }
}
