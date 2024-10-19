import BowlingGame from "../../main/games/BowlingGame.js";
import GameHandler from "../../main/base/GameHandler.js";
import {GameId} from "socket-game-types";
import {expect} from "chai";

describe('Bowling Tests', () => {

    let game: BowlingGame;
    let anyGame: any;
    let gameHandler: GameHandler;
    const gameId: GameId = ['Bowling', 0];

    beforeEach(() => {
        game = BowlingGame.GAME_TYPE.creation() as BowlingGame;
        anyGame = game;
        gameHandler = new GameHandler();
    });

    describe('#init()', () => {
        it('should initialize an empty frames array', () => {
            game.init(gameHandler, gameId);
            expect(anyGame.getGameData().frames).to.deep.equal([]);
        });
        it('should initialize the frames array with the correct player id for one player', () => {
            game.init(gameHandler, gameId);
            let player = game.join();
            game.start();
            expect(anyGame.getGameData().frames).to.deep.equal([[player, []]]);
            expect(anyGame.getGameData().currentFrame).to.deep.equal(0);
        })
    });

});
