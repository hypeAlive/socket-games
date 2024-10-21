import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {GameService} from '../../../shared/services/game.service';
import {SocketJoin} from 'socket-game-types';

@Injectable({
  providedIn: 'root'
})
export class ConnectionGuard implements CanActivate {

  constructor(private gameService: GameService, private router: Router) {

  }


  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const hash = route.paramMap.get('hash');

    if (!hash) {
      await this.router.navigate(['/']);
      return false;
    }

    if(this.gameService.isInRoom(hash)) {
      return true;
    }

    await this.router.navigate(['/join', hash]);
    return true;
  }

}
