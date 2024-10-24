import GameHandler from "../../main/base/GameHandler.js";
import {expect} from "chai";
import {TestableBaseGame, TestableGameNamespace} from "./test_basegame.spec.js";
import {Subscription} from "rxjs";
import {Event, Events, GameId} from "socket-game-types";
import {GameType} from "../../main/types/base/game.type.js";
import BaseGame from "../../main/base/BaseGame.js";

describe('GameHandler Tests', () => {

    const testableGameType: GameType<any, any, any> = {
        namespace: TestableGameNamespace,
        creation: () => new TestableBaseGame()
    };

    let gameHandler: GameHandler;

    beforeEach(() => {
        gameHandler = new GameHandler();
    });

    describe('#register()', () => {
        const gameType: GameType<any, any, any> = {
            namespace: TestableGameNamespace,
            creation: () => {
                return null as any;
            }
        };

        it('should register a game', () => {
            gameHandler.register(gameType);

            const registered: Map<string, GameType<any, any, any>> = (gameHandler as any).registered;

            expect(registered.has(gameType.namespace)).is.true;
        });

        it('should throw an error if game is already registered', () => {
            gameHandler.register(gameType);
            expect(() => gameHandler.register(gameType)).to.throw;
        });
    });

    describe('#create()', () => {

        it('should create a game', () => {

            gameHandler.register(testableGameType);

            const game = gameHandler.create(TestableGameNamespace);

            expect(game).to.not.be.null;
        });

        it('should throw an error if game is not registered', () => {
            expect(() => gameHandler.create(TestableGameNamespace)).to.throw;
        });
    });

    describe('#subscribe()', () => {

        let testState: boolean;
        let resolvePromise: (value: unknown) => void;
        let eventReceivedPromise: Promise<unknown>;
        let subscription: Subscription;
        const gameEvent = (eventType: Events): Event<any, any> => (
            {
                type: eventType,
                gameId: [TestableGameNamespace, 0],
                data: null
            });

        beforeEach(() => {
            testState = false;
            eventReceivedPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
        });

        afterEach(() => {
            if (subscription === undefined) return;
            subscription.unsubscribe();
        });

        it('should subscribe to all events', async () => {

            subscription = gameHandler.subscribe((event) => {
                testState = event.type === Events.GAME_STARTED;
                resolvePromise(null);
            });

            gameHandler.next(gameEvent(Events.GAME_STARTED));

            await eventReceivedPromise;

            expect(testState).to.be.true;
        });

        it('should subscribe to a specific event', async () => {

            subscription = gameHandler.subscribe((event) => {
                testState = event.type === Events.GAME_CREATED;
                resolvePromise(null);
            }, Events.GAME_CREATED);

            gameHandler.next(gameEvent(Events.GAME_CREATED));

            await eventReceivedPromise;

            expect(testState).to.be.true;
        });

        it('should not receive events of different type', async () => {

            subscription = gameHandler.subscribe((event) => {
                testState = event.type === Events.GAME_CREATED;
                resolvePromise(null);
            }, Events.GAME_CREATED);

            gameHandler.next(gameEvent(Events.GAME_STARTED));

            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(testState).to.be.false;
        });

        it('should subscribe to a specific game', async () => {
            subscription = gameHandler.subscribe((event) => {
                testState = event.type === Events.GAME_STARTED;
                resolvePromise(null);
            }, Events.ALL, [TestableGameNamespace, 0]);

            gameHandler.next(gameEvent(Events.GAME_STARTED));

            await eventReceivedPromise;

            expect(testState).to.be.true;
        });

        it('should not receive events of different game', async () => {

            subscription = gameHandler.subscribe(() => {
                testState = true;
                resolvePromise(null);
            }, Events.ALL, [TestableGameNamespace, 1]);

            gameHandler.next(gameEvent(Events.GAME_STARTED));

            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(testState).to.be.false;
        });

    });

    describe('#join() & #leave()', () => {

        let game: BaseGame<any, any, any>;

        beforeEach(() => {
            gameHandler.register(testableGameType);
            game = gameHandler.create(TestableGameNamespace);
        });

        it('should join a game', () => {
            gameHandler.join(game.getId(), "");

            expect((game as any).players.length).to.equal(1);
        });

        it('should throw an error if game is not found while joining', () => {
            const fakeGameId: GameId = ['fakeGameId', 0];
            expect(() => gameHandler.join(fakeGameId, "")).to.throw;
        });

        it('should leave a game', () => {
            const playerId = gameHandler.join(game.getId(), "");
            expect((game as any).players.length).to.equal(1);
            gameHandler.leave(playerId);
            expect((game as any).players.length).to.equal(0);
        });

    });

    describe('#sendAction()', () => {

        let game: BaseGame<any, any, any>;
        let anyGame: any;

        beforeEach(() => {
            gameHandler.register(testableGameType);
            game = gameHandler.create(TestableGameNamespace);
            anyGame = game;
        });

        it('should handle an action', () => {
            gameHandler.join(game.getId(), "");
            gameHandler.join(game.getId(), "");
            game.start();
            const playerId = anyGame.players[0].getId();
            expect(anyGame.receivedAction).to.be.false;
            gameHandler.sendAction(game.getId(), playerId, {});
            expect(anyGame.receivedAction).to.be.true;
        });

        it('should next player', () => {
            gameHandler.join(game.getId(), "");
            gameHandler.join(game.getId(), "");
            game.start();
            const playerId1 = anyGame.players[0].getId();
            const playerId2 = anyGame.players[1].getId();

            gameHandler.sendAction(game.getId(), playerId1, {});
            expect(anyGame.getCurrentPlayer().getId()).to.deep.equal(playerId2);

        });

    });

});