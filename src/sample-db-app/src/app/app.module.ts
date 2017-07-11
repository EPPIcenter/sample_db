import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RouterStoreModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { ComponentsModule } from './components';
import { StudyEffects } from './effects/study';
import { StudyExistsGuard } from './guards/study-exists';
import { LocationEffects } from './effects/location';
import { LocationExistsGuard } from './guards/location-exists';
import { SpecimenTypeEffects } from './effects/specimen-type';
import { SpecimenTypeExistsGuard } from './guards/specimen-type-exists';
import { MatrixPlateEffects } from './effects/plate';
import { MatrixPlateExistsGuard } from './guards/plate-exists';
import { SearchEffects } from './effects/search';
import { BulkEffects } from './effects/bulk';

import { AppComponent } from './containers/app';
import { NotFoundPageComponent } from './containers/not-found-page';

import { StudyListPageComponent } from './containers/study/study-page';
import { CreateStudyPageComponent } from './containers/study/create-study-page';
import { ViewStudyPageComponent } from './containers/study/view-study-page';
import { SelectedStudyPageComponent } from './containers/study/selected-study-page';
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
import { SelectedMatrixPlatePageComponent } from './containers/plate/selected-plate-page';

import { SearchPageComponent } from './containers/search/search-page';

import { BulkPageComponent } from './containers/bulk/bulk-page';

import { StudyService } from './services/study';
import { LocationService } from './services/location';
import { SpecimenTypeService } from './services/specimen-type';
import { MatrixPlateService } from './services/plate';
import { SearchService } from './services/search';
import { BulkService } from './services/bulk';
import { LoggingService } from './services/logging';
import { GlobalErrorHandler } from './services/error-handler';

import { reducer } from './reducers';
import { routes } from './routes';


@NgModule({
  declarations: [
    AppComponent,
    NotFoundPageComponent,
    StudyListPageComponent,
    CreateStudyPageComponent,
    ViewStudyPageComponent,
    SelectedStudyPageComponent,
    EditStudyPageComponent,
    LocationListPageComponent,
    CreateLocationPageComponent,
    EditLocationPageComponent,
    SpecimenTypeListPageComponent,
    CreateSpecimenTypePageComponent,
    EditSpecimenTypePageComponent,
    MatrixPlateListPageComponent,
    CreateMatrixPlatePageComponent,
    UpdateMatrixPlatePageComponent,
    SelectedMatrixPlatePageComponent,
    ViewMatrixPlatePageComponent,
    SearchPageComponent,
    BulkPageComponent
    // SideNavComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule,
    ComponentsModule,
    RouterModule.forRoot(routes, { useHash: true }),
    StoreModule.provideStore(reducer),
    RouterStoreModule.connectRouter(),
    StoreDevtoolsModule.instrumentOnlyWithExtension(),
    EffectsModule.run(StudyEffects),
    EffectsModule.run(LocationEffects),
    EffectsModule.run(SpecimenTypeEffects),
    EffectsModule.run(MatrixPlateEffects),
    EffectsModule.run(SearchEffects),
    EffectsModule.run(BulkEffects)
  ],
  providers: [
    StudyExistsGuard,
    LocationExistsGuard,
    SpecimenTypeExistsGuard,
    MatrixPlateExistsGuard,
    StudyService,
    LocationService,
    SpecimenTypeService,
    MatrixPlateService,
    SearchService,
    BulkService,
    LoggingService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
