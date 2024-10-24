import {NgxLoggerLevel} from "ngx-logger";

export const environment = {
  production: false,
  apiUrl: 'http://localhost:7070/api',
  socketUrl: 'ws://localhost:7070/socket',
  cmsUrl: 'https://cms.nicolasfritz.dev',
  logLevel: NgxLoggerLevel.DEBUG
};
