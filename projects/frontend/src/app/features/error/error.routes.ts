import {Routes} from "@angular/router";
import {ErrorStatusCode} from "./models/error-state";
import {ErrorResolver} from "./services/error.resolver";

const routes: Routes = [
  ...Object.values(ErrorStatusCode).map(statusCode => ({
    path: statusCode.toString(),
    loadComponent: () => import('./pages/error/error.component'),
    title: statusCode.toString(),
    resolve: {
      errorData: ErrorResolver
    },
    data: {
      statusCode,
    }
  })),
  {
    path: "**",
    redirectTo: ErrorStatusCode.NotFound.toString(), // Umleitung zu NotFound
    pathMatch: 'full'
  }
];

export default routes;
