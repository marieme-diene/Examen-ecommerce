import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { provideZoneChangeDetection } from '@angular/core';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideZoneChangeDetection()
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
