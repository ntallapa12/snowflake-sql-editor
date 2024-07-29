import { ApplicationConfig, importProvidersFrom, NgZone } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { FormsModule } from '@angular/forms';
import { initializeMonacoWorkers } from './monaco-config';
import {HttpClientModule} from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(FormsModule, HttpClientModule),
    {
      provide: 'MONACO_INIT',
      useFactory: (ngZone: NgZone) => {
        return () => initializeMonacoWorkers(ngZone);
      },
      deps: [NgZone]
    }
  ]
};
