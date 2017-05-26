import 'rxjs/add/operator/let';
import { Observable } from 'rxjs/Observable';
import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../reducers';
import * as layout from '../actions/layout';
import * as study from '../actions/study';
import * as plate from '../actions/plate';
import * as location from '../actions/location';
import * as specimenType from '../actions/specimen-type';

const ESCAPE_KEY = 27;

@Component({
  selector: 'sdb-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sdb-layout>
      <sdb-sidenav [open]="showSidenav$ | async">
      <sdb-nav-item (activate)="closeSidenav()" routerLink="/search" icon="search" hint="Search for Specimens and Barcodes">
          Search
        </sdb-nav-item>
        <sdb-nav-item (activate)="closeSidenav()" routerLink="/study" icon="book" hint="View, Add, and Edit Studies">
          Studies
        </sdb-nav-item>
        <sdb-nav-item (activate)="closeSidenav()" routerLink="/plate" icon="apps" hint="View, Add, and Update Plates">
          Plates
        </sdb-nav-item>
        <sdb-nav-item (activate)="closeSidenav()" routerLink="/location" icon="room" hint="View, Add, and Edit Locations">
          Locations
        </sdb-nav-item>
        <sdb-nav-item (activate)="closeSidenav()" routerLink="/specimen-type" icon="adb" hint="View, Add, and Edit Specimen Types">
          Specimen Types
        </sdb-nav-item>
        <sdb-nav-item (activate)="closeSidenav()" routerLink="/bulk" icon="delete_forever" hint="Bulk Delete by Subject or Barcode">
          Bulk Delete
        </sdb-nav-item>
      </sdb-sidenav>
      <sdb-toolbar (toggleMenu)="toggleSidenav()" title="Sample DB" [buttons]="toolbarButtons" (toggleButton)="dispatchAction($event)">
      </sdb-toolbar>
      <router-outlet></router-outlet>
    </sdb-layout>
  `
})
export class AppComponent {
  showSidenav$: Observable<boolean>;

  toolbarButtons = [
  //   {
  //     icon: 'arrow_back',
  //     action: back(),
  //     color: 'accent',
  //     tooltip: 'Go Back'
  //   }
  ];

  constructor(private store: Store<fromRoot.State>) {
    this.showSidenav$ = this.store.select(fromRoot.getShowSidenav);
    this.store.dispatch(new study.GetAllAction());
    this.store.dispatch(new plate.GetAllAction());
    this.store.dispatch(new location.GetAllAction());
    this.store.dispatch(new specimenType.GetAllAction());
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.keyCode) {
      case ESCAPE_KEY:
        this.closeSidenav();
        break;
    }
  }

  closeSidenav() {

    this.store.dispatch(new layout.CloseSidenavAction());
  }

  openSidenav() {
    this.store.dispatch(new layout.OpenSidenavAction());
  }

  toggleSidenav() {
    this.store.dispatch(new layout.ToggleSidenavAction());
  }

  dispatchAction(action) {
    this.store.dispatch(action);
  }

}
