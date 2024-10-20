import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError, Observable, retry} from 'rxjs';
import {Router} from "@angular/router";

@Injectable()
export class EnsureHttpInterceptor implements HttpInterceptor {

  constructor(private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry(3),
      catchError(async err => {

        if ([404, 0].includes(err.status)) {
          await this.router.navigate(['404']);
        }

        throw err;
      })
    );
  }
}
