import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimations} from '@angular/platform-browser/animations';
import {environment} from '../environment/environment';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideCoreServices} from './core/core.module';
import {LoggerModule} from 'ngx-logger';

function localeFactory(): string {
  if(!environment.production) return 'de';
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split('/');
  return pathSegments[1] || 'de';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideHttpClient(withInterceptorsFromDi()),
    provideCoreServices(),
    importProvidersFrom(
      LoggerModule.forRoot({
        level: environment.logLevel
      })
    ),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: localeFactory() },
  ]
};
