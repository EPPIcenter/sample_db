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

import { MatrixPlateService } from '../services/plate';
import * as fromRoot from '../reducers';
import * as matrixPlate from '../actions/plate';

@Injectable()
export class MatrixPlateExistsGuard implements CanActivate {
  constructor(
    private store: Store<fromRoot.State>,
    private matrixPlateService: MatrixPlateService,
    private router: Router
  ) { }

  hasPlateInStore(id: string): Observable<boolean> {
    return this.store.select(fromRoot.getMatrixPlateEntities)
      .map(entities => !!entities[id] && entities[id]._detailed)
      .take(1);
  }

  hasPlateInApi(id: string): Observable<boolean> {
    return this.matrixPlateService.getPlate(id)
      .map(matrixPlateEntry => new matrixPlate.LoadOneAction(matrixPlateEntry))
      .do((action: matrixPlate.LoadOneAction) => this.store.dispatch(action))
      .map(matrixPlateEntry => !!matrixPlateEntry)
      .catch(() => {
        this.router.navigate(['/404']);
        return of(false);
      });
  }

  hasPlate(id: string) {
    return this.hasPlateInStore(id)
      .switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        }
        return this.hasPlateInApi(id);
      });
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.hasPlate(route.params['id']);
  }
}
