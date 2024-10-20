import {NgModule, OnInit, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoggerInterceptor} from './interceptors/logger.interceptor';
import {EnsureHttpInterceptor} from './interceptors/ensure-http-interceptor.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {CoreTitleStrategy} from './services/core-tilte.strategy';
import {TitleStrategy} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {initFlowbite} from 'flowbite';
import {DirectusService} from './services/directus.service';

const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: EnsureHttpInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: LoggerInterceptor, multi: true},
];

export const provideCoreServices = () => [
  ...httpInterceptorProviders,
  DirectusService,
  { provide: TitleStrategy, useClass: CoreTitleStrategy },
];


@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ],
})
export class CoreModule implements OnInit{

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule has already been loaded. Import it in the AppModule only.');
    }
  }

  ngOnInit(): void {
    initFlowbite();
  }
}
