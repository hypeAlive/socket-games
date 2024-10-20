import {environment} from "../../../environment/environment";

export interface DirectusTranslation {
  language_code: string;
  id: number;
}

export interface DirectusFile {
  directus_files_id: string;
}

export function getDirectusFileUrl(directusFileUrl: string) {
  return environment.cmsUrl + '/assets/' + directusFileUrl;
}

export enum ErrorMessages {

}
