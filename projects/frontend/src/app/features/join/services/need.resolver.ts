import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {NGXLogger} from "ngx-logger";
import {CmsGame} from '../../home/models/games.interface';
import {GameService} from '../../../shared/services/game.service';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NeedResolver implements Resolve<Promise<CmsGame>> {

  constructor(private router: Router,
              private logger: NGXLogger,
              private game: GameService,
              private toastr: ToastrService) {
  }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {

    const hash = route.params['hash'];
    console.log("need:" + hash);
    if (!hash) {
      await this.router.navigate(['/']);
      this.logger.error(`No game hash provided`);
      return;
    }

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras?.state?.['needs']) {
      return navigation.extras.state['needs'];
    }

    try {
      let needs = await this.game.gameNeeds(hash);
      await this.router.navigate([state.url], { state: { needs: needs } });
    } catch (error) {
      console.error(error);
      await this.router.navigate(['/']);
      this.toastr.error(`Error while joining ${hash}`);
    }
  }
}
