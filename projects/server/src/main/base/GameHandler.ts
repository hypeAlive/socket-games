import {Event, Events, GameId, GameState, PlayerId} from "socket-game-types";
import {GameError} from "./GameError.js";
import BaseGame from "./BaseGame.js";
import {Optional} from "ts-optional";
import {filter, Observer, Subject, Subscription} from "rxjs";
import UniqueId from "../utils/UniqueId.js";
import {GameType} from "../types/base/game.type.js";

/**
 * Handles the registration and Management of games.
 */
export default class GameHandler {

    // Contains all registered game types
    private registered: Map<string, GameType<any, any, any>> = new Map();
    private createdGames: Map<GameId, BaseGame<any, any, any>> = new Map();

    private eventSubject: Subject<Event<any, any>> = new Subject();

    /**
     * Registers a new game type. If the game type is already registered, it throws a GameError.
     * @param {GameType} gameType - The game type to register.
     * @throws {GameError} - Thrown if the game type is already registered.
     */
    public register(gameType: GameType<any, any, any>): void {

        if (this.isRegistered(gameType)) {
            throw new GameError(`Game with namespace ${gameType.namespace} is already registered`);
        }

        this.registered.set(gameType.namespace, gameType);
    }

    /**
     * Creates a new game instance of the specified game type namespace.
     * @param gameNamespace - The namespace of the game type to create.
     * @returns The created game instance.
     */
    public create(gameNamespace: string): BaseGame<any, any, any> {
        return this.getGameType(gameNamespace)
            .map(gameType => {

                const game = gameType.creation();
                const gameId: GameId = this.generateGameId(gameNamespace);
                game.init(this, gameId);
                this.createdGames.set(gameId, game);

                return game;
            })
            .orElseThrow("Game not registered");
    }

    /**
     * Joins a player to a game instance, generating a new player id.
     *
     * @param gameId - The id of the game instance.
     * @param playerId
     * @returns The id of the player that joined the game.
     */
    public join(gameId: GameId, playerName: string, playerId?: PlayerId): PlayerId {
        return this.getGameById(gameId)
            .map(game => game.join(playerName, playerId))
            .orElseThrow("Game not found");
    }

    public createPlayerId(gameId: GameId): PlayerId {
        return this.getGameById(gameId)
            .map(game => game.createPlayerId())
            .orElseThrow("Game not found");
    }

    /**
     * Sends an action to a game instance.
     * @param gameId - The id of the game instance.
     * @param playerId - The id of the player sending the action.
     * @param action - The action to send.
     * @throws {GameError} - Thrown if the game is not found.
     */
    public sendAction(gameId: GameId, playerId: PlayerId, action: object): void {
        this.getGameById(gameId)
            .ifPresentOrElse(game =>
                    game.handleAction(playerId, action)
                , () => {
                    throw new GameError("Game not found");
                });
    }

    public start(gameId: GameId): void {
        this.getGameById(gameId)
            .ifPresentOrElse(game =>
                    game.start()
                , () => {
                    throw new GameError("Game not found");
                });
    }

    /**
     * Removes a player from a game instance.
     * @param playerId - The id of the player to remove.
     * @throws {GameError} - Thrown if player / Game not found or Game is not  initialized.
     */
    public leave(playerId: PlayerId): void {
        const game = this.getGameById(playerId[0])
            .orElseThrow("Game not found");

        game.leave(playerId);
    }

    /**
     * Checks if a game type is registered.
     * @param param - The game type object to check or the namespace of the game type.
     * @returns True if the game type is registered, otherwise false.
     * @private
     */
    public isRegistered(param: string | GameType<any, any, any>): boolean {
        if (typeof param === 'string') return this.registered.has(param);

        return this.registered.has(param.namespace);
    }

    /**
     * Gets the game type by its namespace out of the registered game map.
     * @param namespace - The namespace of the game type.
     * @private
     */
    private getGameType(namespace: string): Optional<GameType<any, any, any>> {
        return Optional.ofNullable(this.registered.get(namespace));
    }

    /**
     * Gets the game instance by its id.
     * @param gameId - The id of the game instance.
     * @private
     */
    private getGameById(gameId: GameId): Optional<BaseGame<any, any, any>> {
        for (const [key, game] of this.createdGames.entries()) {
            if (this.areGameIdsEqual(key, gameId)) {
                return Optional.ofNullable(game);
            }
        }
        return Optional.empty();
    }

    private areGameIdsEqual(id1: GameId, id2: GameId): boolean {
        return id1[0] === id2[0] && id1[1] === id2[1];
    }

    /**
     * Generates a unique game id for the specified game namespace.
     * @param gameNamespace - The namespace of the game type.
     * @private
     */
    private generateGameId(gameNamespace: string): GameId {
        const gameIds = Array.from(this.createdGames.keys())
            .filter(([id]) => id === gameNamespace)
            .map(([, number]) => number)
            .sort((a, b) => a - b);

        return UniqueId.generateUniqueNamespaceId(gameIds, gameNamespace);
    }

    /**
     * Gets a list of all running games.
     * You can filter the games by namespace and state.
     * @param namespace - The namespace of the game type.
     * @param state - The state of the game.
     * @returns A list of all running games.
     */
    public getRunningGames(namespace: string | undefined = undefined, state: GameState | undefined = undefined): BaseGame<any, any, any>[] {
        return Array.from(this.createdGames.values()).filter(game => {
            const matchesNamespace = namespace ? game.getId()[0] === namespace : true;
            const matchesState = state !== undefined ? game.getState() === state : true;
            return matchesNamespace && matchesState;
        });
    }

    /**
     * Emits the next game event.
     * @param event - The game event to emit.
     */
    public next(event: Event<any, any>): void {
        this.eventSubject.next(event);
    }

    /**
     * Subscribes to game events, optionally filtered by a specific game ID.
     * @param observerOrNext - The observer or next function to call when an event is emitted.
     * @param eventType - The type of event to subscribe to, default is all events.
     * @param gameId - Optional game ID to filter events for a specific game.
     * @returns The subscription object.
     */
    public subscribe(observerOrNext?: Partial<Observer<Event<any, any>>> | ((value: Event<any, any>) => void), eventType: Events = Events.ALL, gameId?: GameId): Subscription {
        return this.eventSubject.pipe(
            filter((gameEvent: Event<any, any>) =>
                (eventType === Events.ALL || gameEvent.type === eventType) &&
                (!gameId || gameEvent.gameId && gameId[0] === gameEvent.gameId[0] && gameId[1] === gameEvent.gameId[1])
            )
        ).subscribe(observerOrNext);
    }

    public deleteGame(gameId: GameId): void {
        let game: Optional<any> = this.getGameById(gameId);

        for (const [key, game] of this.createdGames.entries()) {
            if (this.areGameIdsEqual(key, gameId)) {
                this.createdGames.delete(key);
            }
        }

        let anyGame = game.get();
        anyGame = undefined;
    }

}