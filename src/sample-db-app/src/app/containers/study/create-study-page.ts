import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as study from '../../actions/study';
import { Study } from '../../models/study';

@Component({
  selector: 'sdb-create-study-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle"></sdb-toolbar>
  <sdb-study-form [error]="createStudyError$ | async" [(study)]="newStudy"
    (submitButton)="submitStudy()" (cancelButton)="cancelSubmitStudy()">
  </sdb-study-form>
  `
})
export class CreateStudyPageComponent {
  store: Store<fromRoot.State>;
  createStudyError$: Observable<string>;
  newStudy: Study;
  toolbarColor = 'accent';
  toolbarTitle = 'New Study';

  constructor(store: Store<fromRoot.State>) {
    this.store = store;
    this.createStudyError$ = store.select(fromRoot.getCreateStudyError);
    this.newStudy = {
      id: null,
      created: null,
      last_updated: null,
      title: null,
      description: null,
      short_code: null,
      is_longitudinal: false,
      lead_person: null,
      subjects: []
    };
  }

  submitStudy() {
    this.store.dispatch(new study.CreateAction(this.newStudy));
    this.newStudy = Object.assign({}, this.newStudy);
  }

  cancelSubmitStudy() {
    this.store.dispatch(go('/study'));
  }
}
