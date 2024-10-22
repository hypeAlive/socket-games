import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {io, Socket} from 'socket.io-client';
import {environment} from '../../../environment/environment';
import {
  ApiCreateGame,
  ApiGameHash,
  SOCKET_DISCONNECT, SOCKET_GAME_EVENT,
  SOCKET_JOIN,
  SOCKET_JOIN_ACCEPT,
  SOCKET_JOIN_ERROR,
  Event,
  SocketJoin
} from 'socket-game-types';
import {lastValueFrom} from 'rxjs';
import {RoomNeeds} from 'socket-game-types/src/websocket/room.type';
import {NGXLogger} from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private socket: Socket;
  private roomHash: string | undefined;

  constructor(private http: HttpClient, private logger: NGXLogger) {
    this.socket = io(environment.socketUrl, {
      autoConnect: false
    });

    this.socket.on(SOCKET_DISCONNECT, () => {
      this.roomHash = undefined;
    });

    this.socket.on(SOCKET_GAME_EVENT, (data: Event<any, any>) => {
      this.logger.debug("received game event:", data);
    });
  }

  public createGame(namespace: string, password?: string) {
    return lastValueFrom(this.http.post<ApiGameHash>(`${environment.apiUrl}/create`, {
      namespace: namespace,
      password: password,
      hasPassword: !!password
    } as ApiCreateGame));
  }

  public async gameExists(hash: string) {
    try {
      await lastValueFrom(this.http.get(`${environment.apiUrl}/exists/${hash}`, {responseType: 'text'}));
      return true;
    } catch (error: any) {
      return error.status === 200;
    }
  }

  public async gameNeeds(hash: string): Promise<RoomNeeds> {
    return await lastValueFrom(this.http.get<RoomNeeds>(`${environment.apiUrl}/needs/${hash}`));
  }

  private connect() {
    this.socket.connect();
  }

  public isInRoom(hash: string) {
    console.log(this.roomHash, hash);
    return this.roomHash === hash;
  }

  public leave() {
    if(!this.roomHash) return;
  }

  public join(joinData: SocketJoin) {
    if(this.roomHash) return Promise.resolve(false);
    if(!this.socket.connected) {
      this.connect();
    }

    return new Promise((resolve) => {
      const onJoinAccept = () => {
        cleanup();
        this.roomHash = joinData.hash;
        resolve(true);
      };

      const onJoinError = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        this.socket.off(SOCKET_JOIN_ACCEPT, onJoinAccept);
        this.socket.off(SOCKET_JOIN_ERROR, onJoinError);
      };

      this.socket.on(SOCKET_JOIN_ACCEPT, onJoinAccept);
      this.socket.on(SOCKET_JOIN_ERROR, onJoinError);

      this.socket.emit(SOCKET_JOIN, joinData);
    });
  }

}
