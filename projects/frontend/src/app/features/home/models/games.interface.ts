import {DirectusTranslation} from '../../../shared/models/directus.interface';

export interface CmsGame {
  id: number,
  icon: string,
  translations: CmsGameTranslation[]
  unique_code: string,
}

export interface CmsGameTranslation extends DirectusTranslation {
  description: string,
  title: string,
}
