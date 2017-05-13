import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Location } from '../models/location';

@Injectable()
export class LocationService {
  private API_PATH = 'http://localhost:5000';

  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {}

  getLocations(): Observable<Location[]> {
    return this.http.get(`${this.API_PATH}/location`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map(locations => {
        locations.forEach(location => {
          location.id = location.id.toString();
          location.created = new Date(location.created);
          location.last_updated = new Date(location.last_updated);
        });
      return locations;
      });
  }

  getLocation(id: string): Observable<Location> {
    return this.http.get(`${this.API_PATH}/location/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      })
      .map((location: Location) => {
        location._detailed = true;
        location.id = location.id.toString();
        location.created = new Date(location.created);
        location.last_updated = new Date(location.last_updated);
        return location;
      });
  }

  createLocation(location: Location): Observable<Location> {
    return this.http.post(`${this.API_PATH}/location`, {'location': location}, {headers: this.headers})
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  deleteLocation(id: number): Observable<boolean> {
    return this.http.delete(`${this.API_PATH}/location/${id}`)
      .map(res => res.json())
      .map(res => {
        if (Object.keys(res.error).length === 0) {
          return res.data;
        } else {
          throw(new Error(JSON.stringify(res.error)));
        }
      });
  }

  updateLocation(location: Location): Observable<Location> {
    return this.createLocation(location);
  }
}
