import {NgxLoggerLevel} from "ngx-logger";

export const environment = {
  production: true,
  apiUrl: 'https://games.nicolasfritz.dev/api',
  socketUrl: 'wss://games.nicolasfritz.dev/socket',
  cmsUrl: 'https://cms.nicolasfritz.dev',
  logLevel: NgxLoggerLevel.INFO
};
