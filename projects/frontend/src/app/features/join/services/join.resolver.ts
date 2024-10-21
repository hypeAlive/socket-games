import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {NGXLogger} from "ngx-logger";
import {DirectusService} from "../../../core/services/directus.service";
import {CmsGame} from '../../home/models/games.interface';

@Injectable({
  providedIn: 'root'
})
export class JoinResolver implements Resolve<Promise<CmsGame>> {

  constructor(private router: Router, private logger: NGXLogger, private directus: DirectusService) {
  }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras?.state?.['join']) {

    }

    await this.router.navigate(['/']);
  }
}