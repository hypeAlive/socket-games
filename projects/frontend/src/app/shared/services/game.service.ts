import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {io, Socket} from 'socket.io-client';
import {environment} from '../../../environment/environment';
import {
  ApiCreateGame,
  ApiGameHash,
  Event,
  Events,
  GameData,
  GameState,
  isGameEvent,
  isPlayerEvent,
  isSystemYouAre,
  PlayerAction,
  PlayerData,
  SOCKET_DISCONNECT,
  SOCKET_GAME_ACTION,
  SOCKET_GAME_EVENT, SOCKET_GAME_RECREATE,
  SOCKET_GAME_START,
  SOCKET_JOIN,
  SOCKET_JOIN_ACCEPT,
  SOCKET_JOIN_ERROR,
  SOCKET_MESSAGE,
  SOCKET_SYSTEM_EVENT,
  SocketJoin,
  SocketMessage,
  SystemEvent
} from 'socket-game-types';
import {BehaviorSubject, lastValueFrom, Observer} from 'rxjs';
import {RoomNeeds} from 'socket-game-types/src/websocket/room.type';
import {NGXLogger} from 'ngx-logger';

export interface FrontendMessage extends SocketMessage{
  isMe: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private socket: Socket;
  private roomHash: string | undefined;
  private gameDataSubject: BehaviorSubject<any | undefined> = new BehaviorSubject<any | undefined>(undefined);
  private playerDataSubject: BehaviorSubject<any | undefined> = new BehaviorSubject<any | undefined>(undefined);
  public isRoomOwner: boolean = false;
  public messages: FrontendMessage[] = [];
  private id: string | undefined;
  private name: string | undefined;

  constructor(private http: HttpClient,
              private logger: NGXLogger) {
    this.socket = io(environment.socketUrl, {
      autoConnect: false
    });

    this.socket.on(SOCKET_DISCONNECT, () => {
      this.roomHash = undefined;
    });

    this.socket.on(SOCKET_GAME_EVENT, (data: Event<any, any>) => {
      if(isGameEvent(data)) {
        if(data.data.state === GameState.ENDED && data.type === Events.PLAYER_LEFT) return;
        this.logger.debug("received game event:", data);
        this.gameDataSubject.next(data['data']);
      } else if (isPlayerEvent(data)) {
        this.logger.debug("received player event:", data);
        this.playerDataSubject.next(data['data']);
      } else
        this.logger.debug("received unknown event:", data);
    });

    this.socket.on(SOCKET_MESSAGE, (data: SocketMessage) => {
      this.messages.push({
        ...data,
        isMe: data.senderId === this.id
      });
    });

    this.socket.on(SOCKET_SYSTEM_EVENT, (data:SystemEvent) => {
      this.logger.debug("received system event:", data);
      if(isSystemYouAre(data)) {
        this.id = data.id;
        this.name = data.name;
        this.isRoomOwner = data.owner;
      }
    })


  }

  public sendAction(action: PlayerAction) {
    this.socket.emit(SOCKET_GAME_ACTION, action);
  }

  public sendStartGame() {
    if (!this.roomHash) return;
    if (!this.isRoomOwner) return;
    this.socket.emit(SOCKET_GAME_START, {})
  }

  public sendRecreateGame() {
    if (!this.roomHash) return;
    if (!this.isRoomOwner) return;
    console.log("sending recreate game");
    this.socket.emit(SOCKET_GAME_RECREATE, {})
  }

  public createGame(namespace: string, password?: string) {
    return lastValueFrom(this.http.post<ApiGameHash>(`${environment.apiUrl}/create`, {
      namespace: namespace,
      password: password,
      hasPassword: !!password
    } as ApiCreateGame));
  }

  public subscribeGameData<T extends GameData>(observerOrNext?: Partial<Observer<T | undefined>> | ((value: T | undefined) => void)) {
    return this.gameDataSubject.subscribe(observerOrNext);
  }

  public subscribePlayerData<T extends PlayerData>(observerOrNext?: Partial<Observer<T | undefined>> | ((value: T | undefined) => void)) {
    return this.playerDataSubject.subscribe(observerOrNext);
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

  public sendMessage(message: string) {
    if(!this.roomHash) return;
    this.socket.emit(SOCKET_MESSAGE, message);
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
