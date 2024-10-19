import {GameData} from "../base/game.type.js";
import {PlayerAction, PlayerId} from "../base/player.type.js";


export const DartNamespace = 'Dart';

export type DartGameData = GameData & {
    points: [player: PlayerId, points: number][]
    throw: number;
}

export type DartAction = PlayerAction & {
    field: DartField;
}

export type DartField = {
    field: number;
    multiplier: number;
};



