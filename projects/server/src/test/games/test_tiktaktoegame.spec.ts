import GameHandler from "../../main/base/GameHandler.js";
import {
    Events,
    GameEvent,
    GameId,
    GameState,
    PlayerData,
    PlayerId,
    TikTakToeAction,
    TikTakToeGameData
} from "socket-game-types";
import TikTakToeGame from "../../main/games/TikTakToeGame.js";
import {expect} from "chai";
import GamePlayer from "../../main/base/GamePlayer.js";
import {Subscription} from "rxjs";

describe('TikTakToe Tests', () => {

    let game: TikTakToeGame;
    let anyGame: any;
    let gameHandler: GameHandler;
    let gameId: GameId;
    let resolvePromise: (value: unknown) => void;
    let eventReceivedPromise: Promise<unknown>;
    let subscription: Subscription;

    beforeEach(() => {
        gameHandler = new GameHandler();
        gameHandler.register(TikTakToeGame.GAME_TYPE);
        game = gameHandler.create(TikTakToeGame.GAME_TYPE.namespace) as TikTakToeGame;
        gameId = game.getId();
        anyGame = game;
        eventReceivedPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
    });

    describe('#init()', () => {

        it('should initialize the game board', () => {
            expect(anyGame.getGameData().board).to.deep.equal([
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ]);
        });

    });

    describe('emulate game', () => {

        it('run test game', async () => {
            anyGame.join();
            anyGame.join();

            const expectedBoard: (boolean | null)[][] = [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ];

            const actions = [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 2, y: 0},
                {x: 2, y: 2}
            ];

            let i = 0;

            let winner: PlayerId;

            const nextSub = gameHandler.subscribe((event: GameEvent<TikTakToeGameData>) => {
                if(i === 0) {
                    winner = event.data.playerIds[event.data.currentPlayerIndex];
                }
                expect(event.data.board).to.deep.equal(expectedBoard);

                const action = actions[i];
                expectedBoard[action.x][action.y] = i++ % 2 === 0;

                gameHandler.sendAction(
                    event.gameId,
                    event.data.playerIds[event.data.currentPlayerIndex],
                    {
                        playerId: event.data.playerIds[event.data.currentPlayerIndex],
                        ...action
                    }
                );
            }, Events.NEXT_TURN, gameId);

            const endSub = gameHandler.subscribe((event: GameEvent<TikTakToeGameData>) => {
                expect(event.data.board).to.deep.equal(expectedBoard);
                expect(event.data.winnerId).to.not.be.undefined;
                expect(winner).to.not.be.undefined;
                expect(event.data.winnerId).to.be.deep.equal(winner);
                resolvePromise(null);
            }, Events.GAME_ENDED, gameId);

            anyGame.start();

            await eventReceivedPromise;

            nextSub.unsubscribe();
            endSub.unsubscribe();

        })

    });

});