import '@ngrx/core/add/operator/select';
import 'rxjs/add/operator/map';
import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as matrixPlate from '../../actions/plate';

@Component({
  selector: 'sdb-view-plate-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sdb-selected-plate-page></sdb-selected-plate-page>
  `
})
export class ViewMatrixPlatePageComponent implements OnDestroy {
  actionSubscription: Subscription;

  constructor(store: Store<fromRoot.State>, route: ActivatedRoute) {
    this.actionSubscription = route.params
      .select<string>('id')
      .map(id => new matrixPlate.SelectAction(id))
      .subscribe(store);
  }

  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }
}
