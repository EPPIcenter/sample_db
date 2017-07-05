import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { MatrixPlate, MatrixPlateEntry } from '../models/plate';
import * as _ from 'lodash';

@Injectable()
export class MatrixPlateService {
  private API_PATH = 'http://localhost:5000';
  private headers = new Headers({'Content-Type': 'application/json'});
  private postFileHeaders = new Headers({'Content-Type': undefined});

  constructor(private http: Http) {}

  getPlates(): Observable<MatrixPlate[]> {
    return this.http.get(`${this.API_PATH}/plate`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map((plates: MatrixPlate[]) => {
        plates.forEach(plate => {
          if (plate.created) {
            plate.created = new Date(plate.created);
            plate.last_updated = new Date(plate.last_updated);
          }
        });
        return plates;
      });
  }

  getPlate(id: string): Observable<MatrixPlateEntry> {
    return this.http.get(`${this.API_PATH}/plate/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error.matrix_plate).length === 0 &&
            Object.keys(res.error.study_subject).length === 0 &&
            Object.keys(res.error.specimen).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map((plateEntry: MatrixPlateEntry) => {
        if (!Array.isArray(plateEntry.matrix_plate)) {
          plateEntry.matrix_plate._detailed = true;
          plateEntry.matrix_plate.created = new Date(plateEntry.matrix_plate.created);
          plateEntry.matrix_plate.last_updated = new Date(plateEntry.matrix_plate.last_updated);
          plateEntry.specimen = plateEntry.specimen.map(specimen => {
            if (specimen.collection_date) {
              specimen.collection_date = new Date(specimen.collection_date);
            }
            return specimen;
          });
          return plateEntry;
        } else {
          throw(new Error('Something bad happened getting a plate.'))
        }
      });
  }

  deletePlate(id: string): Observable<boolean> {
    return this.http.delete(`${this.API_PATH}/plate/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.success;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  uploadPlate(plateEntry: {
    file: File,
    plate_uid: string,
    location_id: string,
    create_missing_subjects: boolean,
    create_missing_specimens: boolean
  }): Observable<MatrixPlateEntry> {
    return this.postFiles([plateEntry.file], `${this.API_PATH}/plate/upload`, _.omit(plateEntry, 'file'))
      .map(res => {
        if (Object.keys(res.error.matrix_plate).length === 0 &&
            Object.keys(res.error.study_subject).length === 0 &&
            Object.keys(res.error.specimen).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  updatePlates(plateFiles: File[]): Observable<MatrixPlateEntry> {
    return this.postFiles(plateFiles, `${this.API_PATH}/plate/update`)
      .map(res => {
        if (Object.keys(res.error.matrix_plate).length === 0 &&
            Object.keys(res.error.study_subject).length === 0 &&
            Object.keys(res.error.specimen).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  hidePlates(plateIds: number[]): Observable<MatrixPlate[]> {
    return this.http.post(`${this.API_PATH}/plate/hide`, {plate_ids: plateIds}, {headers: this.headers})
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error.matrix_plate).length === 0) {
          return res.data.matrix_plate;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  };

  unhidePlates(plateIds: number[]): Observable<MatrixPlate[]> {
    return this.http.post(`${this.API_PATH}/plate/unhide`, {plate_ids: plateIds}, {headers: this.headers})
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error.matrix_plate).length === 0) {
          return res.data.matrix_plate;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }


  postFiles(files: File[], url: string, params: Object={}) {
    const promise = new Promise<any>((resolve, reject) => {
      const formData = new FormData();
      const xhr = new XMLHttpRequest();
      for (let i = 0; i < files.length; i ++) {
        if (files[i]) {
          formData.append('files', files[i], files[i].name);
        }
      }
      Object.keys(params).forEach(p => {
        formData.append(p, params[p]);
      });
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            const res = JSON.parse(xhr.response);
            res.status = xhr.status;
            reject(res);
          }
        }
      };
      xhr.open('POST', url, true);
      xhr.send(formData);
    });
    return fromPromise(promise).map(res => res);
  }

}
