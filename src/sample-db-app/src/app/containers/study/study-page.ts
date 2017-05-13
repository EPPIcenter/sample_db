import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';
import * as _ from 'underscore';

import * as fromRoot from '../../reducers';
import * as study from '../../actions/study';
import { Study } from '../../models/study';

@Component({
  selector: 'sdb-study-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle" [buttons]="toolbarButtons" (toggleButton)="dispatchAction($event)">
  </sdb-toolbar>
  <sdb-study-preview-list [studies]="studies$ | async"></sdb-study-preview-list>

  `,
})
export class StudyListPageComponent {
  store: Store<fromRoot.State>;
  studies$: Observable<Study[]>;
  toolbarButtons = [
    {
      icon: 'add',
      action: go(['/study/create']),
      color: 'primary',
      tooltip: 'Add New Study'
    }
  ];
  toolbarColor = 'accent';
  toolbarTitle = 'Studies';

  constructor(store: Store<fromRoot.State>) {
    this.store = store;

    const sortProperty$ = of('last_updated');
    this.studies$ = store.select(fromRoot.getAllStudies);
    this.studies$ = combineLatest(sortProperty$, this.studies$, (prop, items) => {
      return _.sortBy(items, prop).reverse();
    });
    store.dispatch(new study.GetAllAction());
  }

  dispatchAction(action) {
    this.store.dispatch(action);
  }
}
