import DartGame from "../../main/games/DartGame.js";
import GameHandler from "../../main/base/GameHandler.js";
import {DartNamespace, GameId} from "socket-game-types";
import {expect} from "chai";


describe('Dart Tests', () => {

    let game: DartGame;
    let anyGame: any;
    let gameHandler: GameHandler;
    const gameId: GameId = [DartNamespace, 0];

    beforeEach(() => {
        game = DartGame.GAME_TYPE.creation() as DartGame;
        anyGame = game;
        gameHandler = new GameHandler();
    });

    describe('#init()', () => {

        it('should initialize an empty point array', () => {
            game.init(gameHandler, gameId);
            expect(anyGame.getGameData().points).to.deep.equal([]);
        });
        it('should initialize the points array with the correct player id for one player', () => {
            game.init(gameHandler, gameId);
            let player = game.join();
            game.start();
            expect(anyGame.getGameData().points).to.deep.equal([[player, 301]]);
        })
    });

    describe('#points()', () => {
        it('should return points of player', () => {
            game.init(gameHandler, gameId);
            let player = game.join();
            game.start();
            expect(anyGame.getPoints(player)).to.equal(301);
        });
        it('should set points of player', () => {
            game.init(gameHandler, gameId);
            let player = game.join();
            game.start();
            anyGame.setPoints(player, 300);
            expect(anyGame.getPoints(player)).to.equal(300);

        });

    });
    describe('#DartFields', () => {
    it('should generate all possible dart fields correctly', () => {

        const dartFields = anyGame.getDartFields();
        expect(dartFields).to.have.lengthOf(62); // all fields
        expect(dartFields).to.deep.include({ field: 20, multiplier: 1 });
        expect(dartFields).to.deep.include({ field: 20, multiplier: 2 });
        expect(dartFields).to.deep.include({ field: 20, multiplier: 3 });
        expect(dartFields).to.deep.include({ field: 25, multiplier: 1 }); // Bull's Eye
        expect(dartFields).to.deep.include({ field: 25, multiplier: 2 }); // Bull
        });
    });
    describe('#Check if thrown points are valid', () => {
        it('should net be a valid field', () => {
            const dartFields = anyGame.getDartFields();
            expect(dartFields).to.not.deep.include({ field: 20, multiplier: 0 });
            expect(dartFields).to.not.deep.include({ field: 21, multiplier: 1 });
            expect(dartFields).to.not.deep.include({ field: 22, multiplier: 2 });
        });
    });
    describe('#isValidField()', () => {
        it('should check if field is possible with multiplier', () => {
            game.init(gameHandler, gameId);
            game.join();
            game.start();
            expect(anyGame.isValidField(57)).to.be.true;
            expect(anyGame.isValidField(50)).to.be.true;
            expect(anyGame.isValidField(35)).to.be.false;
            expect(anyGame.isValidField(59)).to.be.false;
        });
    });

    describe('#Analyse Points of Player', () => {
        it('should check whether the player has 0 points and has won the game', () => {
            game.init(gameHandler, gameId);
            let player = game.join();
            game.start();
            anyGame.setPoints(player, 241);
            anyGame.setPoints(player, 181);
            anyGame.setPoints(player, 121);
            anyGame.setPoints(player, 61);
            anyGame.setPoints(player, 1);
            anyGame.setPoints(player, 0);
            const gamePlayer = anyGame.checkWinCondition();
            expect(gamePlayer).to.be.not.null;
            expect(gamePlayer.getId()).to.equal(player);
        });
        it('should trigger an error and not update the points if they fall below zero', () => {
            game.init(gameHandler, gameId);
            let player = game.join();
            game.start();
            anyGame.setPoints(player, 19);
            anyGame.handleAction(player, {field: {multiplier: 1, field: 20}});
            expect(anyGame.getPoints(player)).to.equal(19);
        });
    });




});