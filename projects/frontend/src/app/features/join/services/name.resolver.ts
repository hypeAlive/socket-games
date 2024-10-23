import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {NGXLogger} from "ngx-logger";
import {DirectusService} from "../../../core/services/directus.service";
import {CmsGame} from '../../home/models/games.interface';
import {RoomNeeds} from 'socket-game-types/dist/src/websocket/room.type';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NameResolver implements Resolve<string> {

  constructor(
    private logger: NGXLogger,
    private client: HttpClient
  ) {
  }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<string> {
    const userData = await lastValueFrom<any>(this.client.get('https://randomuser.me/api'));

    return userData?.results[0]?.name?.first || "Player";
  }
}
