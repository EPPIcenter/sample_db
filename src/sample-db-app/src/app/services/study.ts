import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Study, StudyEntry } from '../models/study';
import { StudySubject, Specimen } from '../models/study-subject';
// import { Specimen } from '../models/specimen';

@Injectable()
export class StudyService {
  private API_PATH = 'http://localhost:5000';

  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {}

  getStudies(): Observable<Study[]> {
    return this.http.get(`${this.API_PATH}/study`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map(studies => {
        studies.forEach(study => {
          if (study.created) {
            study.created = new Date(study.created);
            study.last_updated = new Date(study.last_updated);
            study.subjects = study.subjects.map(id => String(id));
          }
        });
        return studies;
      });
  }

  getStudy(id: string): Observable<StudyEntry> {
    return this.http.get(`${this.API_PATH}/study/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error.study).length === 0 &&
            Object.keys(res.error.specimen).length === 0 &&
            Object.keys(res.error.study_subject).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map((studyEntry: StudyEntry) => {
        studyEntry.study._detailed = true;
        studyEntry.study.created = new Date(studyEntry.study.created);
        studyEntry.study.last_updated = new Date(studyEntry.study.last_updated);
        studyEntry.specimen = studyEntry.specimen.map(specimen => {
          if (specimen.collection_date) {
            specimen.collection_date = new Date(specimen.collection_date);
          }
          return specimen;
        });
        studyEntry.study.subjects = studyEntry.study.subjects.map(id => String(id));
        return studyEntry;
      });
  }

  createStudy(study: Study): Observable<StudyEntry> {
    return this.http.post(`${this.API_PATH}/study`, {'study': study}, {headers: this.headers})
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error.study).length === 0 &&
            Object.keys(res.error.specimen).length === 0 &&
            Object.keys(res.error.study_subject).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map((studyEntry: StudyEntry) => {
        studyEntry.study.created = new Date(studyEntry.study.created);
        studyEntry.study.last_updated = new Date(studyEntry.study.last_updated);
        studyEntry.specimen = studyEntry.specimen.map(specimen => {
          if (specimen.collection_date) {
            specimen.collection_date = new Date(specimen.collection_date);
          }
          return specimen;
        });
        return studyEntry;
      });
  }

  deleteStudy(id: number): Observable<boolean> {
    return this.http.delete(`${this.API_PATH}/study/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.success;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  updateStudy(study: Study): Observable<StudyEntry> {
    return this.createStudy(study);
  }

  deleteStudySubject(id: number): Observable<boolean> {
    return this.http.delete(`${this.API_PATH}/study-subject/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.success;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }


}
