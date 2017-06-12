import { Base } from './base';
import { StudySubject, Specimen } from './study-subject';

export interface MatrixPlateEntry {
  matrix_plate: MatrixPlate | MatrixPlate[];
  study_subject?: StudySubject[];
  specimen?: Specimen[];
  matrix_tube?: MatrixTube[];
}

export interface StorageContainer extends Base {
  specimen: string;
  comments: string;
  exhausted: boolean;
  discriminator: string;
}

export interface MatrixTube extends StorageContainer {
  barcode: string;
  well_position: string;
  plate: string;
}

export interface MatrixPlate extends Base {
  uid: string;
  hidden: boolean;
  tubes: string[];
  location: string;
}
