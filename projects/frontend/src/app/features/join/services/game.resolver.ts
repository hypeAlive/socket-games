import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {NGXLogger} from "ngx-logger";
import {DirectusService} from "../../../core/services/directus.service";
import {CmsGame} from '../../home/models/games.interface';
import {RoomNeeds} from 'socket-game-types/dist/src/websocket/room.type';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class GameResolver implements Resolve<Promise<CmsGame>> {

  constructor(private router: Router,
              private logger: NGXLogger,
              private directus: DirectusService,
              private toastr: ToastrService) {
  }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras?.state?.['game'])
      return navigation.extras.state['game'] as CmsGame;

    if (navigation?.extras?.state?.['needs']) {
      const needs = navigation.extras.state['needs'] as RoomNeeds;
      this.logger.info('GameResolver', needs);
      return await this.directus
        .readItemWithTranslation<CmsGame>('games', {
          _filter: {
            unique_code: {
              _eq: needs.namespace
            }
          }
        })
        .catch(async () => {
          await this.router.navigate(['/']);
          this.toastr.error(`Game ${needs.namespace} does not exist`);
          return;
        });
    }

    await this.router.navigate(['/']);
    //this.toastr.error(`No game hash provided`);
  }
}
