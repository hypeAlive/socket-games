import {DirectusTranslation} from "../../../shared/models/directus.interface";

export interface ErrorApiResponse {
  code: number;
  error_icon: string;
  link: string;
  show_link_button: boolean;
  translations: ErrorTranslations[]
  scheduled_until?: string;
}

export interface ErrorTranslations extends DirectusTranslation {
  message: string;
  description: string;
  link_button: string;
}
