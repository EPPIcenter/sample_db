import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/let';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { LocationService } from '../services/location';
import * as fromRoot from '../reducers';
import * as location from '../actions/location';

@Injectable()
export class LocationExistsGuard implements CanActivate {
  constructor(
    private store: Store<fromRoot.State>,
    private locationService: LocationService,
    private router: Router
  ) { }

  hasLocationInStore(id: string): Observable<boolean> {
    return this.store.select(fromRoot.getLocationEntities)
      .map(entities => !!entities[id] && entities[id]._detailed)
      .take(1);
  }

  hasLocationInApi(id: string): Observable<boolean> {
    return this.locationService.getLocation(id)
      .map(locationEntity => new location.LoadOneAction(locationEntity))
      .do((action: location.LoadOneAction) => this.store.dispatch(action))
      .map(location => !!location)
      .catch(() => {
        this.router.navigate(['/404']);
        return of(false);
      });
  }

  hasLocation(id: string) {
    return this.hasLocationInStore(id)
      .switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        }
        return this.hasLocationInApi(id);
      })
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.hasLocation(route.params['id']);
  }
}
