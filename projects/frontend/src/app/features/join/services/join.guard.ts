import {Injectable} from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanMatch,
  UrlSegment,
  Route
} from '@angular/router';
import {GameService} from '../../../shared/services/game.service';
import {SocketJoin} from 'socket-game-types';

@Injectable({
  providedIn: 'root'
})
export class JoinGuard implements CanMatch {

  constructor(private gameService: GameService, private router: Router) {

  }


  async canMatch(route: Route, segments: UrlSegment[]): Promise<boolean> {
    const hash = segments[1].path;

    console.log(route);

    console.log(segments);

    if (!hash) {
      await this.router.navigate(['/']);
      return false;
    }

    if (!await this.gameService.gameExists(hash)) {
      await this.router.navigate(['/']);
      return false;
    }

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras?.state?.['join']) {
      const join = navigation.extras.state['join'] as SocketJoin;

      if(await this.gameService.join(join)) {
        await this.router.navigate(['/game', hash]);
        return false;
      }
    }

    return true;
  }

}
