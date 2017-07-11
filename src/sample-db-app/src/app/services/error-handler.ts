import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { LoggingService } from './logging';
import * as StackTrace from 'stacktrace-js';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private injector: Injector) { }

  handleError(error: Error) {
    const loggingService = this.injector.get(LoggingService);
    const location = this.injector.get(LocationStrategy);
    const message = error.message ? error.message : error.toString();
    const url = location instanceof PathLocationStrategy ? location.path() : '';
    StackTrace.fromError(error).then(stackframes => {
      const stackString = stackframes
        .splice(0, 10)
        .map(sf => sf.toString())
        .join('\n');
      loggingService.logError({ message, url, stack: stackString })
        .subscribe();
    });

    throw error;
  }
}
