import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as bulk from '../../actions/bulk';

@Component({
  selector: 'sdb-bulk-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle"></sdb-toolbar>
    <sdb-search-file
      [title]="deleteSpecimensTitle"
      [error]="deleteSpecimensError$ | async"
      [success]="deleteSpecimensSuccess$ | async"
      (submit)="deleteSpecimens($event)">
    </sdb-search-file>
    <sdb-search-file
      [title]="deleteBarcodesTitle"
      [error]="deleteBarcodesError$ | async"
      [success]="deleteBarcodesSuccess$ | async"
      (submit)="deleteBarcodes($event)">
    </sdb-search-file>
  `
})
export class BulkPageComponent {
  store: Store<fromRoot.State>;
  deleteSpecimensError$: Observable<string>;
  deleteBarcodesError$: Observable<string>;
  deleteSpecimensSuccess$: Observable<string>;
  deleteBarcodesSuccess$: Observable<string>;

  toolbarColor = 'accent';
  toolbarTitle = 'Bulk Delete';

  deleteSpecimensTitle = 'Delete by Specimen';
  deleteBarcodesTitle = 'Delete by Barcode';

  constructor(store: Store<fromRoot.State>) {
    this.store = store;
    this.deleteBarcodesError$ = store.select(fromRoot.getBulkDeleteBarcodesError);
    this.deleteSpecimensError$ = store.select(fromRoot.getBulkDeleteSpecimensError);
    this.deleteBarcodesSuccess$ = store.select(fromRoot.getBulkDeleteBarcodesSuccess);
    this.deleteSpecimensSuccess$ = store.select(fromRoot.getBulkDeleteSpecimensSuccess)
    this.store.dispatch(new bulk.ClearErrors());
  }

  deleteSpecimens(f: File) {
    if (f) {
      this.store.dispatch(new bulk.DeleteSpecimensAction(f));
    } else {
      this.store.dispatch(new bulk.DeleteSpecimensFailureAction('Please Select a File'));
    }
  }

  deleteBarcodes(f: File) {
    if (f) {
      this.store.dispatch(new bulk.DeleteBarcodesAction(f));
    } else {
      this.store.dispatch(new bulk.DeleteBarcodesFailureAction('Please Select a File'));
    }
  }
}
