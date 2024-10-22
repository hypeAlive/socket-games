import {GameData, GameId} from "./game.type.js";
import {PlayerData, PlayerId} from "./player.type.js";

/**
 * Represents a game event.
 */
export type Event<PD extends PlayerData, GD extends GameData> = GameEvent<GD> | PlayerEvent<PD>;

export interface BaseEvent {
    type: Events;
    gameId: GameId;
    playerId?: PlayerId;
}

export interface PlayerEvent<PD extends PlayerData> extends BaseEvent {
    data: PD;
}

export interface GameEvent<GD extends GameData> extends BaseEvent {
    data: GD;
}

/**
 * Types of game events.
 */
export enum Events {
    ALL = 'ALL',
    GAME_CREATED = 'GAME_CREATED',
    GAME_STARTED = 'GAME_STARTED',
    GAME_DATA_CHANGED = 'GAME_DATA_CHANGED',
    PLAYER_JOINED = 'PLAYER_JOINED',
    PLAYER_LEFT = 'PLAYER_LEFT',
    PLAYER_DATA_CHANGED = 'PLAYER_DATA_CHANGED',
    NEXT_TURN = 'NEXT_TURN',
    GAME_ENDED = 'GAME_ENDED'
}

export function isGameEvent(event: Event<any, any>): event is GameEvent<any> {
    return 'gameId' in event.data && (event as GameEvent<any>).data !== undefined;
}

export function isPlayerEvent(event: Event<any, any>): event is PlayerEvent<any> {
    return 'playerId' in event.data && (event as PlayerEvent<any>).data !== undefined;
}