import GameHandler from "../../main/base/GameHandler.js";
import {
    Events,
    GameEvent,
    GameId,
    GameState,
    PlayerData,
    PlayerId,
    ConnectFourAction,
    ConnectFourGameData
} from "socket-game-types";
import ConnectFourGame from "../../main/games/ConnectFourGame.js";
import { expect } from "chai";
import GamePlayer from "../../main/base/GamePlayer.js";
import { Subscription } from "rxjs";

describe('ConnectFour Tests', () => {

    let game: ConnectFourGame;
    let anyGame: any;
    let gameHandler: GameHandler;
    let gameId: GameId;
    let resolvePromise: (value: unknown) => void;
    let eventReceivedPromise: Promise<unknown>;
    let subscription: Subscription;

    beforeEach(() => {
        gameHandler = new GameHandler();
        gameHandler.register(ConnectFourGame.GAME_TYPE);
        game = gameHandler.create(ConnectFourGame.GAME_TYPE.namespace) as ConnectFourGame;
        gameId = game.getId();
        anyGame = game;
        eventReceivedPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
    });

    describe('#create game', () => {

        it('should create a new game', () => {
            expect(game).to.be.instanceOf(ConnectFourGame);
        });

    });

    describe('#init()', () => {

        it('should initialize the game board', () => {
            expect(anyGame.getGameData().board).to.deep.equal([
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null]
            ]);
        });

    });

    describe('#onPlayerAction()', () => {

        let playerOne: PlayerId;
        let playerTwo: PlayerId;

        beforeEach(() => {
            playerOne = game.join();
            playerTwo = game.join();
            anyGame.start();
        });

        it('should throw an error if the action is invalid', () => {
            const action = {x: 7} as ConnectFourAction;
            expect(() => anyGame.handleAction(playerOne, action)).to.throw("Invalid action");
        });

        it('should accept a valid action', () => {
            const action = {x: 0} as ConnectFourAction;
            expect(() => anyGame.handleAction(playerOne, action)).to.not.throw();
        });
    
    });

    describe('#emulate game', () => {
        describe('#fill column', () => {

            it('should fill a column', () => {
                const playerOne = game.join();
                const playerTwo = game.join();
                
                const actionsPlayerOne = [{x: 0}, {x: 0}, {x: 0}, {x: 0}];
                const actionsPlayerTwo = [{x: 0}, {x: 0}, {x: 0}];

                anyGame.start();

                for (let i = 0; i < 3; i++) {
                    expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[i])).to.not.throw();
                    expect(() => anyGame.handleAction(playerTwo, actionsPlayerTwo[i])).to.not.throw();
                }

                expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[3])).to.throw("Invalid action");
            });

        });
    });


    describe('#win game', () => {

        it('should win with four in one column', () => {
            const playerOne = game.join();
            const playerTwo = game.join();
            
            const actionsPlayerOne = [{x: 0}, {x: 1}, {x: 0}, {x: 1}, {x: 0}, {x: 1}, {x: 0}];
            const actionsPlayerTwo = [{x: 2}, {x: 3}, {x: 2}, {x: 3}, {x: 2}, {x: 3}];

            anyGame.start();

            for (let i = 0; i < 6; i++) {
                expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[i])).to.not.throw();
                expect(() => anyGame.handleAction(playerTwo, actionsPlayerTwo[i])).to.not.throw();
            }

            expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[6])).to.not.throw();

            expect(anyGame.checkWinCondition().playerData.playerId[1]).to.equal(playerOne[1]);
        });

        it('should win with four in one row', () => {
            const playerOne = game.join();
            const playerTwo = game.join();
            
            const actionsPlayerOne = [{x: 0}, {x: 1}, {x: 2}, {x: 3}];
            const actionsPlayerTwo = [{x: 0}, {x: 1}, {x: 2}];

            anyGame.start();

            for (let i = 0; i < 3; i++) {
                expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[i])).to.not.throw();
                expect(() => anyGame.handleAction(playerTwo, actionsPlayerTwo[i])).to.not.throw();
            }

            expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[3])).to.not.throw();

            expect(anyGame.checkWinCondition().playerData.playerId[1]).to.equal(playerOne[1]);
        });

        it('should win with four diagonal upwards', () => {
            const playerOne = game.join();
            const playerTwo = game.join();
            
            const actionsPlayerOne = [{x: 0}, {x: 1}, {x: 2}, {x: 2}, {x: 3}, {x: 3}];
            const actionsPlayerTwo = [{x: 1}, {x: 2}, {x: 3}, {x: 3}, {x: 2}];

            anyGame.start();

            for (let i = 0; i < 5; i++) {
                expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[i])).to.not.throw();
                expect(() => anyGame.handleAction(playerTwo, actionsPlayerTwo[i])).to.not.throw();
            }

            expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[5])).to.not.throw();

            expect(anyGame.checkWinCondition().playerData.playerId[1]).to.equal(playerOne[1]);
        });

        it('should win with four diagonal downwards', () => {
            const playerOne = game.join();
            const playerTwo = game.join();
            
            const actionsPlayerOne = [{x: 0}, {x: 3}, {x: 0}, {x: 1}, {x: 1}, {x: 2}];
            const actionsPlayerTwo = [{x: 0}, {x: 0}, {x: 1}, {x: 2}, {x: 1}];

            anyGame.start();

            for (let i = 0; i < 5; i++) {
                expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[i])).to.not.throw();
                expect(() => anyGame.handleAction(playerTwo, actionsPlayerTwo[i])).to.not.throw();
            }

            expect(() => anyGame.handleAction(playerOne, actionsPlayerOne[5])).to.not.throw();

            expect(anyGame.checkWinCondition().playerData.playerId[1]).to.equal(playerOne[1]);
        });

    });
    
});


