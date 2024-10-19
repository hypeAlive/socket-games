import BaseGame from "../base/BaseGame.js";
import {
    BowlingAction,
    BowlingGameData,
    DartNamespace as NAMESPACE,
    Events,
    GameEvent,
    PlayerData,
    PlayerId,
    PlayerAction
} from "socket-game-types";
import GamePlayer from "../base/GamePlayer.js";
import {GameType} from "../types/base/game.type.js";
import {Subscription} from "rxjs";
import {GameError} from "../base/GameError.js";
import {Optional} from "ts-optional";
import {Frame} from "socket-game-types/dist/src/games/bowling.type.js";


export default class BowlingGame extends BaseGame<PlayerData, BowlingGameData, BowlingAction> {
    static BowlingGame: Frame[];
    protected onPlayerAction(player: GamePlayer<PlayerData>, action: PlayerAction): boolean {
        throw new Error("Method not implemented.");
    }
    public static readonly GAME_TYPE: GameType<PlayerData, BowlingGameData, BowlingAction> = {
        namespace: NAMESPACE,
        creation: () => new BowlingGame()
    }

    private static readonly MAX_PLAYERS = 4;
    private static readonly MIN_PLAYERS = 1;

    constructor() {
        super(BowlingGame.MIN_PLAYERS, BowlingGame.MAX_PLAYERS);
    }

    protected checkWinCondition(): GamePlayer<PlayerData> | null {
        return null;
    }

    /**
     * Initializes the game with default game data.
     * This method is called when the game instance is created and sets the initial game data.
     * In this case, it initializes the game with an empty array of frames.
     * @protected
     */
    protected onInit(): void {
        this.setInitialGameData({
            frames: [],
            currentFrame: 0
        })

        /**
         * Subscribes to the GAME_STARTED event to initialize the game data with the correct player ids.
         * The current frame is set to 0.
         * The subscription is stored in a variable to be unsubscribed when the GAME_ENDED event is emitted.
         * @type {Subscription}
          */
        let startSubscription: Subscription;
        startSubscription = this.subscribe((event: GameEvent<BowlingGameData>) => {
            const frames: [player: PlayerId, frameScores:  Frame[]][] = [];
            const currentFrame = 0;
            event.data.playerIds.forEach(playerId => {
                frames.push([playerId, []])
            });
            event.data.currentFrame = currentFrame;
            this.updateGameData({frames: frames, currentFrame: currentFrame});
        }, Events.GAME_STARTED);

        let endSubscription: Subscription;
        endSubscription = this.subscribe((event: GameEvent<BowlingGameData>) => {
            startSubscription.unsubscribe();
            endSubscription.unsubscribe();
        }, Events.GAME_ENDED);


    }
}
