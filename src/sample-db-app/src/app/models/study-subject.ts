import { Base } from './base';
import { Study } from './study';

export interface StudySubject extends Base {
  uid: string;
  study: string;
  specimens: string[];
}

export interface Specimen extends Base {
  study_subject: string;
  specimen_type: string;
  collection_date: Date;
}
