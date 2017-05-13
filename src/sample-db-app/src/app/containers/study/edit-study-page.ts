import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';


import * as fromRoot from '../../reducers';
import * as study from '../../actions/study';
import { Study } from '../../models/study';

@Component({
  selector: 'sdb-edit-study-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <sdb-toolbar [color]="toolbarColor" [title]="selectedStudyTitle$ | async"></sdb-toolbar>
  <sdb-study-form [study]="studyCopy" [error]="editStudyError$ | async" (submitButton)="submitStudy()"
    (cancelButton)="cancelSubmitStudy()">
  </sdb-study-form>
  `,

})
export class EditStudyPageComponent implements OnInit {
  store: Store<fromRoot.State>;
  actionSubscription: Subscription;
  editStudyError$: Observable<string>;
  selectedStudy$: Observable<Study>;
  selectedStudyTitle$: Observable<string>;
  studyCopy: Study;
  toolbarColor = 'accent';

  constructor(store: Store<fromRoot.State>, route: ActivatedRoute) {
    this.store = store;
    this.actionSubscription = route.params
      .select<string>('id')
      .map(id => new study.SelectAction(id))
      .subscribe(store);
    this.selectedStudy$ = store.select(fromRoot.getSelectedStudy);
    this.selectedStudyTitle$ = store.select(fromRoot.getSelectedStudyTitle);
    this.editStudyError$ = store.select(fromRoot.getUpdateStudyError);
  }

  ngOnInit() {
    this.selectedStudy$.take(1).subscribe(study => {
      this.studyCopy = Object.assign({}, study);
    });
  }

  submitStudy() {
    this.store.dispatch(new study.UpdateAction(this.studyCopy));
    this.studyCopy = Object.assign({}, this.studyCopy);
  }

  cancelSubmitStudy() {
    this.selectedStudy$.take(1).subscribe(study => {
      this.store.dispatch(go(`/study/${study.id}`));
    });
  }

}
