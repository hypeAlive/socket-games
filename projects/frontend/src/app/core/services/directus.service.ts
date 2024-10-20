import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {createDirectus, readItems, rest, RestClient} from "@directus/sdk";
import {lastValueFrom} from "rxjs";
import {environment} from "../../../environment/environment";
import {CoreModule} from "../core.module";
import {MaintenanceData} from '../../shared/services/maintenance.guard';
import {DirectusTranslation} from "../../shared/models/directus.interface";

@Injectable({
  providedIn: CoreModule
})
export class DirectusService {

  private readonly client;
  private readonly locale: string;

  constructor(private http: HttpClient, @Inject(LOCALE_ID) locale: string) {
    this.locale = locale;
    this.client = createDirectus(environment.cmsUrl, {
      globals: {
        fetch: (url, options) => lastValueFrom(this.http.request(options.method, url, options))
      }
    })
      .with(rest());
  }

  public getRestClient(): RestClient<any> {
    return this.client;
  }

  public async readItemsWithTranslation<T extends {
    id: number | string,
    translations: DirectusTranslation[]
  }>(items: string, insert: Object = {}) {
    const getData = async (insert: Object) => {
      return await this.getRestClient()
        .request<T[]>(readItems(items, insert));
    }

    let data = await getData(this.withTranslations(insert));

    if (!Array.isArray(data) || data.length === 0) {
      return Promise.reject('No items found');
    }

    const itemsWithTranslations = await Promise.all(data.map(async (item) => {
      if (!item.translations || item.translations.length === 0) {
        try {
          item = await this.readItemWithTranslation<T>(items + "/" + item.id);
        } catch (error) {
          return Promise.reject(error);
        }
      }
      return item;
    }));

    return itemsWithTranslations;
  }

  public async readItemWithTranslation<T extends {
    translations: DirectusTranslation[]
  }>(items: string, insert: Object = {}) {
    const getData = async (insert: Object) => {
      return await this.getRestClient()
        .request<T>(readItems(items, insert));
    }

    let data = await getData(this.withTranslations({
      limit: 1,
      ...insert,
    }));

    if (Array.isArray(data)) {
      if (data.length === 0) return Promise.reject('No items found');
      data = data[0];
    }


    if (!data.translations) return Promise.reject('No translations found');

    if (data.translations.length === 0 && this.isDefaultLocale()) {
      return Promise.reject('No default-translations found');
    }

    if (data.translations.length === 0) {
      data = await getData(this.withFallbackTranslations({
        limit: 1,
        ...insert,
      }));
      if (data.translations.length === 0) {
        return Promise.reject('No default translations found');
      }
    }

    return data;
  }

  public withTranslations(insert: Object = {}) {
    return {
      deep: {
        translations: {
          _filter: {
            languages_code: {_eq: this.getLocale()},
          },
        },
      },
      fields: ['*', {translations: ['*']}],
      ...insert
    };
  }

  public withFallbackTranslations(insert: Object = {}) {
    return {
      deep: {
        translations: {
          _filter: {
            languages_code: {_eq: this.getDefaultLocale()},
          },
        },
      },
      fields: ['*', {translations: ['*']}],
      ...insert
    };
  }

  public isDefaultLocale(): boolean {
    return this.getLocale() === this.getDefaultLocale();
  }

  public getLocale(): string {
    return this.locale;
  }

  public getDefaultLocale(): string {
    return 'en';
  }

  public getMaintenanceData() {
    const currentTimestamp = new Date().toISOString();
    return this.getRestClient()
      .request<MaintenanceData[]>(readItems('maintenance', {
        filter: {
          _or: [
            {
              _and: [
                {scheduled_for: {_lte: currentTimestamp}},
                {scheduled_until: {_gte: currentTimestamp}}
              ]
            },
            {scheduled: {_eq: false}}
          ]
        },
        sort: ['-scheduled', '-scheduled_until'],
        limit: 1
      }));
  }


}
