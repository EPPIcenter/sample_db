import { Routes } from '@angular/router';

import { NotFoundPageComponent } from './containers/not-found-page';
import { StudyListPageComponent } from './containers/study/study-page';
import { CreateStudyPageComponent } from './containers/study/create-study-page';
import { ViewStudyPageComponent } from './containers/study/view-study-page';
import { EditStudyPageComponent } from './containers/study/edit-study-page';
import { LocationListPageComponent } from './containers/location/location-page';
import { CreateLocationPageComponent } from './containers/location/create-location-page';
import { EditLocationPageComponent } from './containers/location/edit-location-page';
import { SpecimenTypeListPageComponent } from './containers/specimen-type/specimen-type-page';
import { CreateSpecimenTypePageComponent } from './containers/specimen-type/create-specimen-type-page';
import { EditSpecimenTypePageComponent } from './containers/specimen-type/edit-specimen-type-page';
import { MatrixPlateListPageComponent } from './containers/plate/plate-page';
import { CreateMatrixPlatePageComponent } from './containers/plate/create-plate-page';
import { UpdateMatrixPlatePageComponent } from './containers/plate/update-plate-page';
import { ViewMatrixPlatePageComponent } from './containers/plate/view-plate-page';
import { SearchPageComponent } from './containers/search/search-page';
import { BulkPageComponent } from './containers/bulk/bulk-page';

import { StudyExistsGuard } from './guards/study-exists';
import { LocationExistsGuard } from './guards/location-exists';
import { SpecimenTypeExistsGuard } from './guards/specimen-type-exists';
import { MatrixPlateExistsGuard } from './guards/plate-exists';

export const routes: Routes = [
  {
    path: 'study',
    component: StudyListPageComponent
  },
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'study/create',
    component: CreateStudyPageComponent
  },
  {
    path: 'study/:id',
    component: ViewStudyPageComponent,
    canActivate: [ StudyExistsGuard ]
  },
  {
    path: 'study/:id/edit',
    component: EditStudyPageComponent,
    canActivate: [ StudyExistsGuard ]
  },
  {
    path: 'location',
    component: LocationListPageComponent
  },
  {
    path: 'location/create',
    component: CreateLocationPageComponent
  },
  {
    path: 'location/:id/edit',
    component: EditLocationPageComponent,
    canActivate: [ LocationExistsGuard ]
  },
  {
    path: 'specimen-type',
    component: SpecimenTypeListPageComponent
  },
  {
    path: 'specimen-type/create',
    component: CreateSpecimenTypePageComponent
  },
  {
    path: 'specimen-type/:id/edit',
    component: EditSpecimenTypePageComponent,
    canActivate: [ SpecimenTypeExistsGuard ]
  },
  {
    path: 'plate',
    component: MatrixPlateListPageComponent
  },
  {
    path: 'plate/create',
    component: CreateMatrixPlatePageComponent
  },
  {
    path: 'plate/update',
    component: UpdateMatrixPlatePageComponent
  },
  {
    path: 'plate/:id',
    component: ViewMatrixPlatePageComponent,
    canActivate: [ MatrixPlateExistsGuard ]
  },
  {
    path: 'search',
    component: SearchPageComponent
  },
  {
    path: 'bulk',
    component: BulkPageComponent
  },
  {
    path: '**', component: NotFoundPageComponent
  }
];
