import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
// import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './layout';
import { SidenavComponent } from './sidenav';
import { ToolbarComponent } from './toolbar';
import { NavItemComponent } from './nav-item';
import { FileInputComponent } from './file-input';
import { StudyPreviewComponent } from './study/study-preview';
import { StudyPreviewListComponent } from './study/study-preview-list';
import { StudyFormComponent } from './study/study-form';
import { StudyDetailComponent } from './study/study-detail';
import { LocationPreviewListComponent } from './location/location-preview-list';
import { LocationPreviewComponent } from './location/location-preview';
import { LocationFormComponent } from './location/location-form';
import { SpecimenTypePreviewListComponent } from './specimen-type/specimen-type-preview-list';
import { SpecimenTypePreviewComponent } from './specimen-type/specimen-type-preview';
import { SpecimenTypeFormComponent } from './specimen-type/specimen-type-form';
import { MatrixPlatePreviewListComponent } from './plate/plate-preview-list';
import { MatrixPlatePreviewComponent } from './plate/plate-preview';
import { MatrixPlateUploadFormComponent } from './plate/plate-upload-form';
import { MatrixPlateUpdateFormComponent } from './plate/plate-update-form';
import { MatrixPlateDetailComponent } from './plate/plate-detail';
import { SearchFileComponent } from './search/search-file';
import { StudySubjectEntryListComponent } from './study/study-subject-entry-list';

import { PipesModule } from '../pipes';

export const COMPONENTS = [
  LayoutComponent,
  SidenavComponent,
  ToolbarComponent,
  NavItemComponent,
  FileInputComponent,
  StudyPreviewComponent,
  StudyPreviewListComponent,
  StudyFormComponent,
  StudyDetailComponent,
  LocationPreviewComponent,
  LocationPreviewListComponent,
  LocationFormComponent,
  SpecimenTypeFormComponent,
  SpecimenTypePreviewComponent,
  SpecimenTypePreviewListComponent,
  MatrixPlatePreviewComponent,
  MatrixPlatePreviewListComponent,
  MatrixPlateUploadFormComponent,
  MatrixPlateUpdateFormComponent,
  MatrixPlateDetailComponent,
  SearchFileComponent,
  StudySubjectEntryListComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // ReactiveFormsModule,
    MaterialModule,
    RouterModule,
    PipesModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS
})

export class ComponentsModule { }
