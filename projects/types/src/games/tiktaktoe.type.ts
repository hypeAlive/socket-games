import {GameData} from "../base/game.type.js";
import {PlayerAction} from "../base/player.type.js";

export const TikTakToeNamespace = 'tiktaktoe';

export type TikTakToeGameData = GameData & {
    board: (boolean | null)[][]
}

export type TikTakToeAction = PlayerAction & {
    x: number,
    y: number
}