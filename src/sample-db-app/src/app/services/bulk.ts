import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';

export interface DeleteQuery {
  matrixTubeIds: string[];
  specimenIds: string[];
}

@Injectable()
export class BulkService {
  private API_PATH = 'http://localhost:17327';
  private postFileHeaders = new Headers({'Content-Type': undefined});

  constructor(private http: Http) {}

  deleteSpecimens(deleteFile: File): Observable<DeleteQuery> {
    return this.postFiles([deleteFile], `${this.API_PATH}/bulk/delete/specimen`, 'specimens.csv')
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return {
            matrixTubeIds: res.data.matrix_tube_ids,
            specimenIds: res.data.specimen_ids
          };
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  deleteBarcodes(deleteFile: File): Observable<DeleteQuery> {
    return this.postFiles([deleteFile], `${this.API_PATH}/bulk/delete/barcode`, 'barcodes.csv')
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return {
            matrixTubeIds: res.data.matrix_tube_ids,
            specimenIds: res.data.specimen_ids
          };
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
