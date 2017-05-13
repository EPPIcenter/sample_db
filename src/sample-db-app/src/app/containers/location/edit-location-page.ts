import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as location from '../../actions/location';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-edit-location-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="selectedLocationDescription$ | async"></sdb-toolbar>
  <sdb-location-form [location]="locationCopy" [error]="editLocationError$ | async" (submitButton)="submitLocation()"
    (cancelButton)="cancelSubmitLocation()">
  </sdb-location-form>
  `
})
export class EditLocationPageComponent implements OnInit {
  store: Store<fromRoot.State>;
  actionSubscription: Subscription;
  editLocationError$: Observable<string>;
  selectedLocation$: Observable<Location>;
  selectedLocationDescription$: Observable<string>;
  locationCopy: Location;
  toolbarColor = 'accent';

  constructor(store: Store<fromRoot.State>, route: ActivatedRoute) {
    this.store = store;
    this.actionSubscription = route.params
      .select<string>('id')
      .map(id => new location.SelectAction(id))
      .subscribe(store);
    this.selectedLocation$ = store.select(fromRoot.getSelectedLocation);
    this.selectedLocationDescription$ = store.select(fromRoot.getSelectedLocationDescription);
    this.editLocationError$ = store.select(fromRoot.getUpdateLocationError);
  }

  ngOnInit() {
    this.selectedLocation$.take(1).subscribe(location => {
      this.locationCopy = Object.assign({}, location);
    });
  }

  submitLocation() {
    this.store.dispatch(new location.UpdateAction(this.locationCopy));
    this.locationCopy = Object.assign({}, this.locationCopy);
  }

  cancelSubmitLocation() {
    this.store.dispatch(go(`/location`));
  }
}
