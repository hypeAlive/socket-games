import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {NGXLogger} from 'ngx-logger';

@Injectable()
export class LoggerInterceptor implements HttpInterceptor {

  constructor(private logger: NGXLogger) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.logger.debug('Request:', req);

    return next.handle(req).pipe(
      tap({
        next: event => this.logger.debug('Response:', event),
        error: error => this.logger.error('Error:', error)
      })
    );
  }
}
