import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as specimenType from '../../actions/specimen-type';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-edit-specimen-type-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="selectedSpecimenTypeLabel$ | async"></sdb-toolbar>
  <sdb-specimen-type-form
    [specimenType]="specimenTypeCopy"
    [updateError]="editSpecimenTypeError$ | async"
    [deleteError]="deleteSpecimenTypeError$ | async"
    (submitButton)="submitSpecimenType()"
    (cancelButton)="cancelSubmitSpecimenType()"
    (deleteButton)="deleteSpecimenType()">
  </sdb-specimen-type-form>
  `
})
export class EditSpecimenTypePageComponent implements OnInit {
  store: Store<fromRoot.State>;
  actionSubscription: Subscription;
  editSpecimenTypeError$: Observable<string>;
  deleteSpecimenTypeError$: Observable<string>;
  selectedSpecimenType$: Observable<SpecimenType>;
  selectedSpecimenTypeId$: Observable<string>;
  selectedSpecimenTypeLabel$: Observable<string>;
  specimenTypeCopy: SpecimenType;
  toolbarColor = 'accent';

  constructor(store: Store<fromRoot.State>, route: ActivatedRoute) {
    this.store = store;
    this.actionSubscription = route.params
      .select<string>('id')
      .map(id => new specimenType.SelectAction(id))
      .subscribe(store);
    this.selectedSpecimenType$ = store.select(fromRoot.getSelectedSpecimenType);
    this.selectedSpecimenTypeId$ = store.select(fromRoot.getSelectedSpecimenTypeId);
    this.selectedSpecimenTypeLabel$ = store.select(fromRoot.getSelectedSpecimenTypeLabel);
    this.editSpecimenTypeError$ = store.select(fromRoot.getUpdateSpecimenTypeError);
    this.deleteSpecimenTypeError$ = store.select(fromRoot.getDeleteSpecimenTypeError);
  }

  ngOnInit() {
    this.selectedSpecimenType$.take(1).subscribe(specimenType => {
      this.specimenTypeCopy = Object.assign({}, specimenType);
    });
  }

  submitSpecimenType() {
    this.store.dispatch(new specimenType.UpdateAction(this.specimenTypeCopy));
    this.specimenTypeCopy = Object.assign({}, this.specimenTypeCopy);
  }

  cancelSubmitSpecimenType() {
    this.store.dispatch(go(`/specimen-type`));
  }

  deleteSpecimenType() {
    this.selectedSpecimenTypeId$.take(1).subscribe(selectedSpecimenTypeId => {
      this.store.dispatch(new specimenType.DeleteAction(selectedSpecimenTypeId));
    });
  }
}
