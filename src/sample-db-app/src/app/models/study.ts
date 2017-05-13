import { Base } from './base';
import { StudySubject, Specimen } from './study-subject';
import { MatrixTube } from './plate';

export interface StudyEntry {
  study: Study;
  study_subject?: StudySubject[];
  specimen?: Specimen[];
  matrix_tube?: MatrixTube[];
}

export interface Study extends Base {
  title: string | null;
  description: string | null;
  short_code: string | null;
  is_longitudinal: boolean | null;
  lead_person: string | null;
  subjects: string[];
};
