import BaseGame from "../../main/base/BaseGame.js";
import {it} from "mocha";
import GameHandler from "../../main/base/GameHandler.js";
import {Events, GameData, GameEvent, GameId, GameState, PlayerAction, PlayerData, PlayerId} from "socket-game-types";
import {expect} from "chai";
import GamePlayer from "../../main/base/GamePlayer.js";

export const TestableGameNamespace = 'testGame';

export class TestableBaseGame extends BaseGame<PlayerData, GameData, PlayerAction> {

    public receivedAction: boolean = false;
    private readonly shuffle: boolean;

    constructor(minPlayers: number = 1, maxPlayers: number = 5, shuffle: boolean = false) {
        super(minPlayers, maxPlayers);
        this.shuffle = shuffle;
    }

    onInit(){
        this.setShuffleBeforeStart(this.shuffle);
    }

    protected checkWinCondition(): GamePlayer<PlayerData> | null {
        return this.players.length === 1 ? this.players[0] : null;
    }

    protected onPlayerAction(player: GamePlayer<PlayerData>, action: PlayerAction): boolean {
        this.receivedAction = true;
        return true;
    }

}

describe('BaseGame Tests', () => {

    let game: BaseGame<any, any, any>;
    let gameHandler: GameHandler;
    const gameId: GameId = [TestableGameNamespace, 0];

    beforeEach(() => {
        game = new TestableBaseGame();
        gameHandler = new GameHandler();
    });

    describe('#getId()', () => {

        it('should return the game id', () => {
            game.init(gameHandler, gameId);

            expect(game.getId()).to.deep.equal(gameId);
        });

        it('should throw an error if game is not initialized', () => {
            expect(() => game.getId()).to.throw;
        });

    });

    describe('#start()', () => {
        it('should start the game', () => {
            game.init(gameHandler, gameId);
            game.join("");
            game.join("");
            game.start();
            expect(game.getState()).to.equal(GameState.RUNNING);
        });

        it('should throw when game can not start', () => {
            expect(() => game.start()).to.throw; //throw because game is not initialized
            game.init(gameHandler, gameId);
            expect(() => game.start()).to.throw; //throw because game has no player
        });

        it('should shuffle player order before game starts', () => {
            const attempts = 100;
            let differentOrderCount = 0;

            for (let i = 0; i < attempts; i++) {
                const gameId: GameId = [TestableGameNamespace, i]; // Verwenden Sie i, um eindeutige gameId für jeden Durchlauf zu haben
                const game = new TestableBaseGame(5,5, true);
                const anyGame: any = game;
                game.init(gameHandler, gameId);

                // Join multiple players to ensure shuffling can occur
                for (let j = 0; j < 5; j++) {
                    game.join("");
                }

                const playerIds: PlayerId[] = anyGame.players.map((player: GamePlayer<any>) => player.getId());
                const initialOrder: number[] = playerIds.map((id: PlayerId) => id[1]);

                game.start();
                const newOrder = anyGame.players.map((player: GamePlayer<any>) => player.getId()[1]);

                if (!newOrder.every((id: number, index: number) => id === initialOrder[index])) {
                    differentOrderCount++;
                }
            }

            expect(differentOrderCount).to.be.greaterThan(attempts * 0.8);
        });
    });

    describe('#end()', () => {

        it('should end the game', () => {
            game.init(gameHandler, gameId);
            game.join("");
            game.join("");
            game.start();
            (game as any).end();
            expect(game.getState()).to.equal(GameState.ENDED);
        });

        it('should throw when game can not end', () => {
            expect(() => (game as any).end()).to.throw; //throw because game is not initialized
            game.init(gameHandler, gameId);
            expect(() => (game as any).end()).to.throw; //because game is not started
        });

        it('should delete the game from the game handler', () => {
            game.init(gameHandler, gameId);
            game.join("");
            game.join("");
            game.start();
            (game as any).end();
            expect(gameHandler.getRunningGames(TestableGameNamespace)).to.be.deep.equal([]);
        });

        it('should send winner', async () => {
            let resolvePromise: (value: unknown) => void;
            let eventReceivedPromise: Promise<unknown>;
            eventReceivedPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            let result = false;
            game.init(gameHandler, gameId);
            game.join("");
            game.join("");
            game.start();
            const sub = gameHandler.subscribe((event: GameEvent<GameData>) => {
                result = event.data.winnerId === (game as any).players[0].getId();
                resolvePromise(null);
            }, Events.GAME_ENDED, gameId);

            (game as any).end((game as any).players[0]);

            await eventReceivedPromise;

            expect(result).to.be.true;

            sub.unsubscribe()
        });
    });

    describe('#leave()', () => {

        let anyGame: any;

        beforeEach(() => {
            game.init(gameHandler, gameId);
            anyGame = game;
            for(let i = 0; i < 5; i++){
                game.join("");
            }
        });

        it('should calc correct next when current leaves', () => {
            game.start();

            //mittleren Spieler testen
            anyGame.next();
            anyGame.next();

            expect(anyGame.currentPlayerIndex).to.equal(2);
            const playerIds: PlayerId[] = anyGame.players
                .map((player: GamePlayer<any>) => player.getId());
            game.leave(playerIds[2]);

            // wenn 2 leaved wenn er gerade dran ist müsste nach dem leave 3 dran sein
            expect(anyGame.players[anyGame.currentPlayerIndex].getId())
                .to.deep.equal(playerIds[3]);
        });

        it('should calc correct next when current > leave', () => {
            game.start();

            anyGame.next();
            anyGame.next();
            anyGame.next();

            // person 3 ist dran
            expect(anyGame.currentPlayerIndex).to.equal(3);
            const playerIds: PlayerId[] = anyGame.players
                .map((player: GamePlayer<any>) => player.getId());
            game.leave(playerIds[2]);

            //immer noch selbe person dran
            expect(anyGame.players[anyGame.currentPlayerIndex].getId())
                .to.deep.equal(playerIds[3]);

            anyGame.next();
            // nächste person dran
            expect(anyGame.players[anyGame.currentPlayerIndex].getId())
                .to.deep.equal(playerIds[4]);

            anyGame.next();

            //richtiger switch zu person 0
            expect(anyGame.players[anyGame.currentPlayerIndex].getId())
                .to.deep.equal(playerIds[0]);

        });

        it('should calc correct next when current < leave', () => {
            game.start();
            // spieler 0 ist dran
            expect(anyGame.currentPlayerIndex).to.equal(0);
            const playerIds: PlayerId[] = anyGame.players
                .map((player: GamePlayer<any>) => player.getId());

            // spieler 1 leaved
            game.leave(playerIds[1]);

            //immer noch selbe person dran
            expect(anyGame.players[anyGame.currentPlayerIndex].getId())
                .to.deep.equal(playerIds[0]);

            anyGame.next();

            //richtiger switch zu person 2
            expect(anyGame.players[anyGame.currentPlayerIndex].getId())
                .to.deep.equal(playerIds[2]);

        });

    });

    describe('#updateGameData()', () => {

        let anyGame: any;
        const testData = {
            test: "test"
        }
        let resolvePromise:  (value: unknown) => void;
        let eventReceivedPromise: Promise<unknown>;

        beforeEach(() => {
            anyGame = game;
            eventReceivedPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
        });

        it('should update the game data', () => {
            game.init(gameHandler, gameId);
            anyGame.updateGameData(testData);
            expect(anyGame.gameData.test).to.deep.equal(testData.test);
        });

        it('should send event to game handler', async () => {
            game.init(gameHandler, gameId);
            let result = false;
            const sub = gameHandler.subscribe((event) => {
                result = event.type === Events.GAME_DATA_CHANGED && event.data.test === testData.test;
                resolvePromise(null);
            }, Events.GAME_DATA_CHANGED, gameId);

            anyGame.updateGameData(testData);

            await eventReceivedPromise;

            expect(result).to.be.true;
            sub.unsubscribe();
        });

        it('should change the player order', () => {
            game.init(gameHandler, gameId);
            for (let i = 0; i < 5; i++) {
                game.join("");
            }
            game.start();
            const playerIds: PlayerId[] = anyGame.players.map((player: GamePlayer<PlayerData>) => player.getId());
            playerIds.reverse();
            anyGame.updateGameData({
                playerIds: playerIds
            });

            expect(anyGame.players.map((player: GamePlayer<PlayerData>) => player.getId())).to.deep.equal(playerIds);
        });

        it('should not change the current player', () => {
            game.init(gameHandler, gameId);
            for (let i = 0; i < 5; i++) {
                game.join("");
            }
            game.start();
            const playerIds: PlayerId[] = anyGame.players.map((player: GamePlayer<PlayerData>) => player.getId());
            const currentPlayer: PlayerId = anyGame.getCurrentPlayer().getId();
            playerIds.reverse();
            anyGame.updateGameData({
                playerIds: playerIds
            });
            const currentPlayer2: PlayerId = anyGame.getCurrentPlayer().getId();

            expect(currentPlayer).to.deep.equal(currentPlayer2);

            anyGame.next();

            expect(anyGame.getCurrentPlayer().getId()).to.deep.equal(playerIds[0]);

        });

    });

    describe('#next()', () => {

        it('should check if the game has been won', () => {
            game.init(gameHandler, gameId);
            game.join("");
            game.start();
            expect(game.getState()).to.equal(GameState.ENDED);
        });

        it('should change to next current player', () => {
            const anyGame: any = game;
            game.init(gameHandler, gameId);
            game.join("");
            game.join("");
            game.start();
            const playerIds: PlayerId[] = (game as any).players
                .map((player: GamePlayer<any>) => player.getId());
            expect(anyGame.players[anyGame.currentPlayerIndex].getId())
                .to.deep.equal(playerIds[0]);
            anyGame.next();
            expect(anyGame.players[anyGame.currentPlayerIndex].getId())
                .to.deep.equal(playerIds[1]);
        });

        it('should throw when game can not next', () => {
            expect(() => (game as any).next()).to.throw; //throw because game is not initialized
            game.init(gameHandler, gameId);
            expect(() => (game as any).next()).to.throw; //throw because game is not started
        });
    });

});