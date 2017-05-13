import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as specimenType from '../../actions/specimen-type';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-create-specimen-type-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle"></sdb-toolbar>
  <sdb-specimen-type-form [updateError]="createSpecimenTypeError$ | async" [(specimenType)]="newSpecimenType"
    (submitButton)="submitSpecimenType()" (cancelButton)="cancelSubmitSpecimenType()">
  </sdb-specimen-type-form>
  `
})
export class CreateSpecimenTypePageComponent{
  store: Store<fromRoot.State>;
  createSpecimenTypeError$: Observable<string>;
  newSpecimenType: SpecimenType;
  toolbarColor = 'accent';
  toolbarTitle = 'Register New Specimen Type';

  constructor(store:  Store<fromRoot.State>) {
    this.store = store;
    this.createSpecimenTypeError$ = store.select(fromRoot.getCreateSpecimenTypeError);
    this.newSpecimenType = {
      id: null,
      created: null,
      last_updated: null,
      label: null
    };
  }

  submitSpecimenType() {
    this.store.dispatch(new specimenType.CreateAction(this.newSpecimenType));
    this.newSpecimenType = Object.assign({}, this.newSpecimenType);
  }

  cancelSubmitSpecimenType() {
    this.store.dispatch(go('/specimen-type'));
  }
}
