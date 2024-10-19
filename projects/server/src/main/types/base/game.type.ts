import BaseGame from "../../base/BaseGame.js";
import {PlayerData} from "socket-game-types/dist/src/base/player.type.js";
import {GameData, PlayerAction} from "socket-game-types";

/**
 * Represents the type of game, including its namespace and creation logic.
 * @interface
 * @property {string} namespace - The unique namespace identifier for the game type.
 * @property {() => {}} creation - A function that defines the creation logic of the game.
 */
export interface GameType<PD extends PlayerData, GD extends GameData, PA extends PlayerAction> {
    namespace: string;
    creation: () => BaseGame<PD, GD, PA>;
}