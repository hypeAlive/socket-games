import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {NGXLogger} from "ngx-logger";
import {DirectusService} from "../../../core/services/directus.service";
import {readItems} from "@directus/sdk";
import {ErrorApiResponse} from "../models/error.interface";
import {ErrorStatusCode} from "../models/error-state";

@Injectable({
  providedIn: 'root'
})
export class ErrorResolver implements Resolve<Promise<ErrorApiResponse>> {

  constructor(private router: Router, private logger: NGXLogger, private directus: DirectusService) {
  }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    const statusCode = route.data['statusCode'];
    this.logger.info(`Resolving error for status code: ${statusCode}`);

    const getData = async (insert: Object) => {
      return await this.directus.getRestClient()
        .request<ErrorApiResponse[]>(readItems('error_page', {
          ...insert,
          filter: {
            code: {
              _eq: statusCode
            }
          },
          fields: ['*', {translations: ['*']}],
          limit: 1
        }));
    }

    let data = await getData(this.directus.withTranslations());

    if (data.length === 0 || (data[0].translations.length === 0 && this.directus.isDefaultLocale())) {
      this.logger.error(`No default-translations found for error with status code: ${statusCode}`);
      if (statusCode !== 404) await this.router.navigate(['/404']);
      return;
    }

    if (data[0].translations.length === 0) {
      this.logger.warn(`No ${this.directus.getLocale()}-translations found for error with status code: ${statusCode}`);
      data = await getData(this.directus.withFallbackTranslations());
      if (data.length === 0 || data[0].translations.length === 0) {
        this.logger.error(`No default translations found for error with status code: ${statusCode}`);
        if (statusCode !== 404) await this.router.navigate(['/404']);
        return;
      }
    }

    this.logger.debug(`Successfully resolved ErrorData for status code: ${statusCode}`, data);

    const result = data[0];

    if (statusCode !== ErrorStatusCode.ServiceUnavailable)
      return result as ErrorApiResponse;

    const guardState = this.router.getCurrentNavigation()?.extras.state;
    if (guardState && guardState['scheduled_until'])
      return {
        ...result,
        scheduled_until: guardState['scheduled_until']
      } as ErrorApiResponse;

    const maintenanceData = await this.directus.getMaintenanceData();

    if (maintenanceData.length !== 0)
      return {
        ...result,
        scheduled_until: maintenanceData[0].scheduled_until
      } as ErrorApiResponse;

    await this.router.navigate(['/404']);
  }
}
