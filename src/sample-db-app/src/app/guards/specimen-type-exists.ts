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

import { SpecimenTypeService } from '../services/specimen-type';
import * as fromRoot from '../reducers';
import * as specimenType from '../actions/specimen-type';

@Injectable()
export class SpecimenTypeExistsGuard implements CanActivate {
  constructor(
    private store: Store<fromRoot.State>,
    private specimenTypeService: SpecimenTypeService,
    private router: Router
  ) { }

  hasSpecimenTypeInStore(id: string): Observable<boolean> {
    return this.store.select(fromRoot.getSpecimenTypeEntities)
      .map(entities => !!entities[id] && entities[id]._detailed)
      .take(1);
  }

  hasSpecimenTypeInApi(id: string): Observable<boolean> {
    return this.specimenTypeService.getSpecimenType(id)
      .map(specimenTypeEntity => new specimenType.LoadOneAction(specimenTypeEntity))
      .do((action: specimenType.LoadOneAction) => this.store.dispatch(action))
      .map(specimenType => !!specimenType)
      .catch(() => {
        this.router.navigate(['/404']);
        return of(false);
      });
  }

  hasSpecimenType(id: string) {
    return this.hasSpecimenTypeInStore(id)
      .switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        }
        return this.hasSpecimenTypeInApi(id);
      })
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.hasSpecimenType(route.params['id']);
  }
}
