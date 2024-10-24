import {HttpStatusCode} from "@angular/common/http";

export enum ErrorStatusCode {
  NotFound = HttpStatusCode.NotFound,
  Unauthorized = HttpStatusCode.Unauthorized,
  Forbidden = HttpStatusCode.Forbidden,
  InternalServerError = HttpStatusCode.InternalServerError,
  ServiceUnavailable = HttpStatusCode.ServiceUnavailable,
}
