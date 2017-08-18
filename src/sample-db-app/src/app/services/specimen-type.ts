import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SpecimenType } from '../models/specimen-type';

@Injectable()
export class SpecimenTypeService {
  private API_PATH = 'http://localhost:17327';

  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {}

  getSpecimenTypes(): Observable<SpecimenType[]> {
    return this.http.get(`${this.API_PATH}/specimen-type`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map(specimenTypes => {
        specimenTypes.forEach(specimenType => {
          specimenType.id = specimenType.id.toString();
          specimenType.created = new Date(specimenType.created);
          specimenType.last_updated = new Date(specimenType.last_updated);
        });
      return specimenTypes;
      });
  }

  getSpecimenType(id: string): Observable<SpecimenType> {
    return this.http.get(`${this.API_PATH}/specimen-type/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map((specimenType: SpecimenType) => {
        specimenType._detailed = true;
        specimenType.id = specimenType.id.toString();
        specimenType.created = new Date(specimenType.created);
        specimenType.last_updated = new Date(specimenType.last_updated);
        return specimenType;
      });
  }

  createSpecimenType(specimenType: SpecimenType): Observable<SpecimenType> {
    return this.http.post(`${this.API_PATH}/specimen-type`, {'specimen_type': specimenType}, {headers: this.headers})
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  deleteSpecimenType(id: number): Observable<boolean> {
    return this.http.delete(`${this.API_PATH}/specimen-type/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  updateSpecimenType(specimenType: SpecimenType): Observable<SpecimenType> {
    return this.createSpecimenType(specimenType);
  }
}
