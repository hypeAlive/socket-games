import {GameId} from "./game.type.js";

/**
 * Unique identifier for a player inside a game.
 * A player is identified by the gameId and a number.
 */
export type PlayerId = [gameId: GameId, identifier: number];

/**
 * Represents the data of a player.
 */
export type PlayerData = {
    name: string,
    playerId: PlayerId,
}

export type PlayerAction = {
    playerId: PlayerId,
}