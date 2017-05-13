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

import { StudyService } from '../services/study';
import * as fromRoot from '../reducers';
import * as study from '../actions/study';

@Injectable()
export class StudyExistsGuard implements CanActivate {
  constructor(
    private store: Store<fromRoot.State>,
    private studyService: StudyService,
    private router: Router
  ) { }

  hasStudyInStore(id: string): Observable<boolean> {
    return this.store.select(fromRoot.getStudyEntities)
      .map(entities => !!entities[id] && entities[id]._detailed)
      .take(1);
  }

  hasStudyInApi(id: string): Observable<boolean> {
    return this.studyService.getStudy(id)
      .map(studyEntry => new study.LoadOneAction(studyEntry))
      .do((action: study.LoadOneAction) => this.store.dispatch(action))
      .map(study => !!study)
      .catch(() => {
        this.router.navigate(['/404']);
        return of(false);
      });
  }

  hasStudy(id: string) {
    return this.hasStudyInStore(id)
      .switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        }
        return this.hasStudyInApi(id);
      });
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.hasStudy(route.params['id']);
  }
}
