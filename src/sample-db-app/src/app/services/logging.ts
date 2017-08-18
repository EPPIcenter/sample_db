import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';


interface LogMessage {
  message: string;
  url: string;
  stack: string;
}
@Injectable()
export class LoggingService {
  private API_PATH = 'http://localhost:17327';
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {}

  logError(logMessage: LogMessage) {
    console.log(logMessage);
    return this.http.post(`${this.API_PATH}/log-error`, logMessage, {headers: this.headers});
  }
}
