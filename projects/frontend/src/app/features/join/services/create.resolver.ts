import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {NGXLogger} from "ngx-logger";
import {DirectusService} from "../../../core/services/directus.service";
import {CmsGame} from '../../home/models/games.interface';
import {ErrorStatusCode} from '../../error/models/error-state';

@Injectable({
  providedIn: 'root'
})
export class CreateResolver implements Resolve<Promise<CmsGame>> {

  constructor(private router: Router, private logger: NGXLogger, private directus: DirectusService) {
  }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras?.state?.['game'])
      return  navigation.extras.state['game'] as CmsGame;

    await this.router.navigate(['/']);
  }
}
