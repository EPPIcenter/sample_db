import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';

@Injectable()
export class SearchService {
  private API_PATH = 'http://localhost:17327';
  private postFileHeaders = new Headers({'Content-Type': undefined});

  constructor(private http: Http) {}

  searchSpecimens(searchFile: File): Observable<boolean> {
    return this.postFiles([searchFile], `${this.API_PATH}/search/specimen`, 'specimens.csv')
      .map(res => {
        return true;
      });
  }

  searchBarcodes(searchFile: File): Observable<boolean> {
    return this.postFiles([searchFile], `${this.API_PATH}/search/barcode`, 'barcodes.csv')
      .map(res => {
        return true;
      });
  }

  postFiles(files: File[], url: string, filename: string, params: Object={}) {
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
            const type = xhr.getResponseHeader('Content-Type');
            const blob = new Blob([xhr.response], { type: type });
            const fileURL = window.URL;
            const downloadUrl = fileURL.createObjectURL(blob);

            if (filename) {
                const a = document.createElement('a');
                if (typeof a.download === 'undefined') {
                    window.location.href = downloadUrl;
                } else {
                    a.href = downloadUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                }
            } else {
                window.location.href = downloadUrl;
            }
            resolve(true);
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
