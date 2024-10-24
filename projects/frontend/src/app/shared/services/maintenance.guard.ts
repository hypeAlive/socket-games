import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {ErrorStatusCode} from "../../features/error/models/error-state";
import {DirectusService} from "../../core/services/directus.service";
import {environment} from "../../../environment/environment";

export type MaintenanceData = {
  scheduled: boolean;
  scheduled_until: string;
  scheduled_for: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceGuard implements CanActivate {

  constructor(private router: Router, private directus: DirectusService) {
  }

  async canActivate(): Promise<boolean> {
    if(!environment.production) return true;

    const data = await this.directus.getMaintenanceData();

    if (data.length === 0)
      return true;

    await this.router.navigate([ErrorStatusCode.ServiceUnavailable.toString()], {
      state: {
        scheduled_until: data[0].scheduled_until,
      }
    });
    return false;
  }

}
