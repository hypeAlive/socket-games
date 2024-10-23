import {PlayerData, PlayerId} from "./player.type.js";

/**
 * Unique identifier for a Game.
 */
export type GameId = [gameNamespace: string, identifier: number];

/**
 * Represents the State of a Game.
 */
export enum GameState {
    NOT_INITIALIZED = 'NOT_INITIALIZED',
    WAITING = 'WAITING',
    RUNNING = 'RUNNING',
    ENDED = 'ENDED'
}

export type GameData = {
    gameId: GameId,
    playerIds: PlayerId[],
    players: PlayerData[],
    minPlayers: number,
    maxPlayers: number,
    state: GameState,
    currentPlayerIndex: number,
    winnerId?: PlayerId,
}