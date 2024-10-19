import BaseGame from "../../main/base/BaseGame.js";
import GameHandler from "../../main/base/GameHandler.js";
import {Events, GameId} from "socket-game-types";
import {TestableBaseGame, TestableGameNamespace} from "./test_basegame.spec.js";
import {it} from "mocha";
import {expect} from "chai";
import GamePlayer from "../../main/base/GamePlayer.js";

describe('GamePlayer Tests', () => {

    let game: BaseGame<any, any, any>;
    let gameHandler: GameHandler;
    let anyGame: any;
    const gameId: GameId = [TestableGameNamespace, 0];

    beforeEach(() => {
        game = new TestableBaseGame();
        gameHandler = new GameHandler();
        anyGame = game;
    });

    describe('#updatePlayerData()', () => {

        const testData = {
            test: "test"
        }
        let resolvePromise:  (value: unknown) => void;
        let eventReceivedPromise: Promise<unknown>;
        let player: GamePlayer<any>;

        beforeEach(() => {
            anyGame = game;
            eventReceivedPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            game.init(gameHandler, gameId);
            player = anyGame.getPlayer(anyGame.join());
        });

        it('should update the game data', () => {
            player.updatePlayerData(testData);
            expect(player.getPlayerData().test).to.deep.equal(testData.test);
        });

        it('should send event to game handler', async () => {
            let result = false;
            const sub = gameHandler.subscribe((event) => {
                result = event.type === Events.PLAYER_DATA_CHANGED && event.data.test === testData.test;
                resolvePromise(null);
            }, Events.PLAYER_DATA_CHANGED, gameId);

            player.updatePlayerData(testData);

            await eventReceivedPromise;

            expect(result).to.be.true;
            sub.unsubscribe();
        });

    });

});