import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as search from '../../actions/search';

@Component({
  selector: 'sdb-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sdb-toolbar [color]="toolbarColor" [title]="toolbarTitle" [buttons]="toolbarButtons">
    </sdb-toolbar>
    <sdb-search-file [title]="searchSpecimensTitle" [error]="searchSpecimensError$ | async" (submit)="searchSpecimens($event)">
    </sdb-search-file>
    <sdb-search-file [title]="searchBarcodesTitle" [error]="searchBarcodesError$ | async" (submit)="searchBarcodes($event)">
    </sdb-search-file>
  `
})
export class SearchPageComponent {
  store: Store<fromRoot.State>;
  searchSpecimensError$: Observable<string>;
  searchBarcodesError$: Observable<string>;

  toolbarButtons = [];
  toolbarColor = 'accent';
  toolbarTitle = 'Search';

  searchSpecimensTitle = 'Search For Specimens';
  searchBarcodesTitle = 'Search For Barcodes';

  constructor(store: Store<fromRoot.State>) {
    this.store = store;
    this.searchSpecimensError$ = store.select(fromRoot.getSearchSpecimensError);
    this.searchBarcodesError$ = store.select(fromRoot.getSearchBarcodesError);
    this.store.dispatch(new search.ClearErrors());
  }

  searchSpecimens(f: File) {
    if (f) {
      this.store.dispatch(new search.SearchSpecimensAction(f));
    } else {
      this.store.dispatch(new search.SearchSpecimensFailureAction('Please Select a File'));
    }
  }

  searchBarcodes(f: File) {
    if (f) {
      this.store.dispatch(new search.SearchBarcodesAction(f));
    } else {
      this.store.dispatch(new search.SearchBarcodesFailureAction('Please Select a File'));
    }
  }

}
