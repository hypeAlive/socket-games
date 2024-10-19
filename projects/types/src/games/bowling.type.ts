import {GameData} from "../base/game.type.js";
import {PlayerAction, PlayerId} from "../base/player.type.js";


export const BowlingNamespace = 'Bowling';

export type Frame = {
  throw1: number;
  throw2: number;
};

export type BowlingGameData = GameData & {
  frames: [player: PlayerId, frameScores: Frame[]][];
  currentFrame: number;
};

export type BowlingAction = PlayerAction




