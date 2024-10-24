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
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class JoinGuard implements CanMatch {

  constructor(private gameService: GameService, private router: Router, private toastr: ToastrService) {

  }


  async canMatch(route: Route, segments: UrlSegment[]): Promise<boolean> {
    const hash = segments[1].path;

    if (!hash) {
      await this.router.navigate(['/']);
      this.toastr.error(`No game hash provided`);
      return false;
    }

    if (!await this.gameService.gameExists(hash)) {
      console.log("game does not exist");
      this.toastr.error(`Game ${hash} does not exist`);
      return false;
    }


    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras?.state?.['join']) {
      const join = navigation.extras.state['join'] as SocketJoin;

      console.log(navigation?.extras?.state)

      if(await this.gameService.join(join)) {
        await this.router.navigate(['/game', hash], {
          state: {
            game: navigation?.extras?.state?.['game']
          }
        });
        this.toastr.success(`Successfully joined game ${hash}`);
        return false;
      } else {
        this.toastr.error(`Failed to join game ${hash}`);
      }
    }

    return true;
  }

}
