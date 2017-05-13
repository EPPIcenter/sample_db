import '@ngrx/core/add/operator/select';
import 'rxjs/add/operator/map';
import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as study from '../../actions/study';

@Component({
  selector: 'sdb-view-study-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-selected-study-page></sdb-selected-study-page>
  `
})
export class ViewStudyPageComponent implements OnDestroy {
  actionSubscription: Subscription;

  constructor(store: Store<fromRoot.State>, route: ActivatedRoute) {
    this.actionSubscription = route.params
      .select<string>('id')
      .map(id => new study.SelectAction(id))
      .subscribe(store);
  }

  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }
}
