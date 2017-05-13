import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';
import * as _ from 'underscore';

import * as fromRoot from '../../reducers';
import * as specimenType from '../../actions/specimen-type';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-specimen-type-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle" [buttons]="toolbarButtons" (toggleButton)="dispatchAction($event)">
  </sdb-toolbar>
  <sdb-specimen-type-preview-list [specimenTypes]="specimenTypes$ | async" (toggleEditButton)="editSpecimenType($event)">
  </sdb-specimen-type-preview-list>
  `
})
export class SpecimenTypeListPageComponent {
  store: Store<fromRoot.State>;
  specimenTypes$: Observable<SpecimenType[]>;

  toolbarButtons = [
    {
      icon: 'add',
      action: go(['/specimen-type/create']),
      color: 'primary',
      tooltip: 'Add New Specimen Type'
    }
  ];
  toolbarColor = 'accent';
  toolbarTitle = 'Specimen Types';

  constructor(store: Store<fromRoot.State>) {
    this.store = store;

    const sortProperty$ = of('label');
    this.specimenTypes$ = store.select(fromRoot.getAllSpecimenTypes);
    this.specimenTypes$ = combineLatest(sortProperty$, this.specimenTypes$, (prop, items) => {
      return _.sortBy(items, prop);
    });
    store.dispatch(new specimenType.GetAllAction());
  }

  dispatchAction(action) {
    this.store.dispatch(action);
  }

  editSpecimenType(id: string) {
    this.store.dispatch(go(`/specimen-type/${id}/edit`));
  }


}
