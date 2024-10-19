import {GameData} from "../base/game.type.js";
import {PlayerAction} from "../base/player.type.js";

export const ConnectFourNamespace = 'connectfour';

export type ConnectFourGameData = GameData & {
    board: (boolean | null)[][]
}

export type ConnectFourAction = PlayerAction & {
    x: number,
    y: number
}