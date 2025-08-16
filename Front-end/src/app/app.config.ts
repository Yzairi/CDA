import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AUTH_INTERCEPTOR_PROVIDER } from './services/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(),
  // Enable Fetch API for HttpClient (improves SSR performance & compatibility)
  provideHttpClient(withFetch(), withInterceptorsFromDi()),
  AUTH_INTERCEPTOR_PROVIDER,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
  }
  ]
};
