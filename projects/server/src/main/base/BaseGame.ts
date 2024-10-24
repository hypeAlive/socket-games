import {
    Event,
    Events,
    GameData,
    GameEvent,
    GameId,
    GameState,
    ID,
    PlayerAction,
    PlayerData,
    PlayerId
} from "socket-game-types";
import GameHandler from "./GameHandler.js";
import GamePlayer from "./GamePlayer.js";
import UniqueId from "../utils/UniqueId.js";
import {GameError} from "./GameError.js";
import {Observer, Subscription} from "rxjs";
import Shuffle from "../utils/Shuffle.js";

/**
 * Represents the base game class that all games should extend.
 * @class
 * @template PD - The type of player data
 * @template GD - The type of game data
 */
export default abstract class BaseGame<PD extends PlayerData, GD extends GameData, PA extends PlayerAction> {

    private gameHandler!: GameHandler;

    private readonly maxPlayers: number;
    private readonly minPlayers: number;
    private gd: GD | undefined;

    // on init configurable variables
    private initialPlayerData: Partial<PD> = {};
    private initialGameData: Partial<GD> = {};
    private shuffleBeforeStart: boolean = true;

    protected players: GamePlayer<PD>[] = [];

    /**
     * Creates a new game instance
     *
     * @param minPlayers - The minimum amount of players required to start the game
     * @param maxPlayers - The maximum amount of players that can join the game
     * @protected
     */
    protected constructor(minPlayers: number, maxPlayers: number) {
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
    }

    /**
     * Initializes the game
     * @param gameHandler - The game handler
     * @param gameId - The game id
     */
    public init(gameHandler: GameHandler, gameId: GameId) {
        this.gameHandler = gameHandler;

        this.gd = {
            gameId: gameId,
            state: this.state,
            minPlayers: this.minPlayers,
            maxPlayers: this.maxPlayers,
            playerIds: [],
            currentPlayerIndex: -1
        } as unknown as GD;

        this.onInit();
        this.state = GameState.WAITING;

        this.updateGameData(this.initialGameData);
    }

    /**
     * Updates the game data
     *
     * You can update the playerIds here to change the player order. The currentPlayer will be the same.
     * Don't change the playerIds itself, only the order!
     *
     * You can not update the state, gameId, currentPlayerIndex, winnerId
     * @param gameData - The game data to update
     * @param sendEvent - default is true, if false no event will be sent
     * @throws {GameError} - Thrown if the game is not initialized, or if the game data is invalid
     * @protected
     */
    protected updateGameData(gameData: Partial<GD> = {}, sendEvent: boolean = true) {
        if (gameData.state) throw new GameError("State can not be updated");
        if (gameData.gameId) throw new GameError("GameId can not be updated");
        if (gameData.currentPlayerIndex) throw new GameError("CurrentPlayerIndex can not be updated");
        if (gameData.winnerId) throw new GameError("WinnerId can not be updated");
        if (!this.gd) throw new GameError("Game not initialized");

        if (gameData.playerIds) {
            const oldPlayerIds: PlayerId[] = this.players.map(player => player.getId());
            const newPlayerIds: PlayerId[] = gameData.playerIds;
            if (oldPlayerIds.length !== newPlayerIds.length)
                throw new GameError("PlayerIds can not be updated. Length does not match");
            if (!oldPlayerIds.every(id => newPlayerIds.includes(id)))
                throw new GameError("PlayerIds can not be updated. Ids do not match");

            const currentPlayerId = this.getCurrentPlayer().getId();
            this.players = newPlayerIds.map(id => this.getPlayer(id));
            this.currentPlayerIndex = this.getIndexByPlayer(currentPlayerId);
            gameData.playerIds = undefined;
        }

        this.gd = {...this.gameData, ...gameData};

        if(!sendEvent) return;

        this.gameHandler.next({
            type: Events.GAME_DATA_CHANGED,
            gameId: this.gameId,
            data: this.gameData
        })
    }

    /**
     * Hook that is called when the game is initialized
     * Use this Hook to initialize your game!
     * Set the initial player data, game data and event subscription here.
     */
    protected abstract onInit(): void;

    /**
     * Checks the win condition of the game
     * @returns GamePlayer<PD> | null - The winning player or null if there is no winner yet
     * @protected
     */
    protected abstract checkWinCondition(): GamePlayer<PD> | null;

    /**
     * Handles a player action, should return true if the player's turn is over
     *
     * @param player - The player that performed the action
     * @param action - The action to handle
     * @returns boolean - True if the player's turn is over, otherwise false
     * @protected
     */
    protected abstract onPlayerAction(player: GamePlayer<PD>, action: PA): boolean;

    /**
     * Handles a player action
     * @param playerId - The id of the player that performed the action
     * @param action - The action to handle
     * @throws {GameError} - Thrown if the player is not found
     */
    public handleAction(playerId: PlayerId, action: PA): void {
        if (!this.isInitialized()) throw new GameError("Game not initialized");
        if (!this.isStarted()) throw new GameError("Game not started");

        const sampleAction: PA = {} as PA; // Create an empty object of type PA
        const requiredProperties = Object.keys(sampleAction);
        for (const prop of requiredProperties) {
            if (!(prop in action)) {
                throw new GameError(`Action is missing required property: ${prop}`);
            }
        }

        const player = this.getPlayer(playerId);
        const nextTurn = this.onPlayerAction(player, action);
        if (!nextTurn) return;

        this.next();
    }

    /**
     * Joins a player to the game, generating a new player id.
     * @throws {GameError} - Thrown if the game is not initialized
     * @returns The generated player id
     */
    public join(playerName: string, playerId?: PlayerId): PlayerId {
        if (!this.isInitialized()) throw new GameError("Game not initialized");

        if(this.players.length >= this.maxPlayers)
            throw new GameError("Too many players: expected " + this.maxPlayers + "- but got " + this.players.length);

        playerId = playerId ? playerId : this.createPlayerId();
        const player = new GamePlayer(playerId, playerName, this, this.initialPlayerData);
        this.players.push(player);

        this.gameHandler.next({
            type: Events.PLAYER_JOINED,
            gameId: this.gameId,
            data: this.gameData
        });

        return player.getId();
    }

    /**
     * Removes a player from the game
     * @param playerId - The id of the player to remove
     * @throws {GameError} - Thrown if the game is not initialized, or the player is not found
     */
    public leave(playerId: PlayerId): void {
        if (!this.isInitialized()) throw new GameError("Game not initialized");

        if (!this.isStarted()) {
            const playerIndex = this.getIndexByPlayer(playerId);
            this.players.splice(playerIndex, 1);
            this.gameHandler.next({
                type: Events.PLAYER_LEFT,
                gameId: this.gameId,
                data: this.gameData
            });
            return;
        }

        const playerIndex = this.getIndexByPlayer(playerId);

        const oldCurrentPlayerIndex = this.currentPlayerIndex;
        // Dekrementieren des currentPlayerIndex, wenn nötig
        if (playerIndex <= this.currentPlayerIndex) {
            this.currentPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
        }
        this.players.splice(playerIndex, 1);

        if (playerIndex === oldCurrentPlayerIndex) {
            this.next();
        } else if (this.players.length <= 1 && this.minPlayers > 1) {
            const player = this.players.length === 1 ? this.players[0] : null;
            this.end(player);
        }

        this.gameHandler.next({
            type: Events.PLAYER_LEFT,
            gameId: this.gameId,
            data: this.gameData
        });
    }

    /**
     * Sets the initial player data
     * @param playerData - The initial player data
     * @throws {GameError} - Thrown if the game is already initialized, or if the player id is set
     * @protected
     */
    protected setInitialPlayerData(playerData: Partial<PD> = {}) {
        if (playerData.playerId) throw new GameError("PlayerId can not be updated");
        if (this.isInitialized()) throw new GameError("Game already initialized");
        this.initialPlayerData = playerData;
    }

    /**
     * Sets if the player order should be shuffled before the game starts
     * Default is true
     * @param shuffleBeforeStart - True if the player order should be shuffled before the game starts, otherwise false
     * @protected
     */
    protected setShuffleBeforeStart(shuffleBeforeStart: boolean) {
        if (this.isInitialized()) throw new GameError("Game already initialized");
        this.shuffleBeforeStart = shuffleBeforeStart;
    }

    /**
     * Sets the initial game data
     * Here you can not change the player order. Use a subscriber to Start Game and updateGameData() instead.
     * @param gameData - The initial game data
     * @throws {GameError} - Thrown if the game is already initialized, or if the state, gameId, currentPlayerIndex, playerIds, winnerId are set
     * @protected
     */
    protected setInitialGameData(gameData: Partial<GD> = {}) {
        if (gameData.state) throw new GameError("State can not be updated");
        if (gameData.gameId) throw new GameError("GameId can not be updated");
        if (gameData.currentPlayerIndex) throw new GameError("CurrentPlayerIndex can not be updated");
        if (gameData.playerIds) throw new GameError("PlayerIds can not be updated");
        if (gameData.winnerId) throw new GameError("WinnerId can not be updated");
        if (this.isInitialized()) throw new GameError("Game already initialized");
        this.initialGameData = gameData;
    }

    /**
     * Starts the game
     * @throws {GameError} - Thrown if the game is not initialized, or if there are not enough players
     */
    public start(): void {
        if (!this.isInitialized()) throw new GameError("Game not initialized");
        if (this.players.length < this.minPlayers)
            throw new GameError("Not enough players: expected " + this.minPlayers + "+ but got " + this.players.length);
        if (this.players.length > this.maxPlayers)
            throw new GameError("Too many players: expected " + this.maxPlayers + "- but got " + this.players.length);

        if (this.shuffleBeforeStart)
            this.randomizePlayerOrder();

        this.state = GameState.RUNNING;

        this.gameHandler.next({
            type: Events.GAME_STARTED,
            gameId: this.gameId,
            data: this.gameData
        });

        this.next();
    }

    /**
     * Ends the game. If a winner is provided, the winner will be set in the game data
     * @param winner - The winning player
     * @throws {GameError} - Thrown if the game is not initialized, or if the game is not started
     * @private
     */
    private end(winner: GamePlayer<PD> | null): void {
        if (!this.isInitialized()) throw new GameError("Game not initialized");
        if (!this.isStarted()) throw new GameError("Game not started");

        this.state = GameState.ENDED;

        const event: GameEvent<GD> = {
            type: Events.GAME_ENDED,
            gameId: this.gameId,
            data: {
                ...this.gameData,
                ...{
                    winnerId: !winner ? undefined : winner.getId()
                }
            },
        }

        this.gameHandler.next(event);
    }

    /**
     * Advances to the next player and checks if the game is over
     * @private
     */
    protected next(): void {
        if (!this.isInitialized()) throw new GameError("Game not initialized");
        if (!this.isStarted()) throw new GameError("Game not started");

        let player = this.checkWinCondition();
        if (player || (this.players.length <= 1 && this.minPlayers > 1)) {
            player = player ? player : (this.players.length === 1 ? this.players[0] : null);
            this.end(player);
            return;
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        setTimeout(() => {
            this.gameHandler.next({
                type: Events.NEXT_TURN,
                gameId: this.gameId,
                data: this.gameData
            })
        }, 0);
    }

    /**
     * Creates a new player id
     * @returns The new player id
     * @private
     */
    public createPlayerId(): PlayerId {
        const existingPlayerIds: ID[] = this.players
            .map(player => player.getId()[1]);

        return [this.gameId, UniqueId.generateUniqueId(existingPlayerIds)]
    }

    /**
     * Returns the game id
     * @throws {GameError} - Thrown if the game is not initialized
     * @returns The game id
     */
    public getId(): GameId {
        if (!this.isInitialized()) throw new GameError("Game not initialized");
        return this.gameId;
    }

    /**
     * Returns the current game state
     * @returns The current game state
     */
    public getState(): GameState {
        return this.state;
    }

    /**
     * Returns if the game is initialized
     * @returns True if the game is initialized, otherwise false
     */
    public isInitialized(): boolean {
        return this.state !== GameState.NOT_INITIALIZED;
    }

    /**
     * Returns if the game is started
     * @returns True if the game is started, otherwise false
     */
    public isStarted(): boolean {
        return this.state === GameState.RUNNING;
    }

    /**
     * Returns the player index by player id
     * @param playerId - The player id
     * @returns The player index
     * @throws {GameError} - Thrown if the player is not found in this game
     * @protected
     */
    protected getIndexByPlayer(playerId: PlayerId): number {
        const index = this.players.findIndex(player => player.getId() === playerId);
        if (index === -1) throw new GameError("Player not found");
        return index;
    }

    /**
     * Returns the player by player id
     * @param playerId - The player id
     * @returns The player
     * @throws {GameError} - Thrown if the player is not found in this game
     * @protected
     */
    protected getPlayer(playerId: PlayerId): GamePlayer<PD> {
        const index = this.getIndexByPlayer(playerId);
        return this.players[index];
    }

    /**
     * Returns the current player
     * @returns The current player
     * @throws {GameError} - Thrown if there is no current player
     * @protected
     */
    protected getCurrentPlayer(): GamePlayer<PD> {
        if (this.currentPlayerIndex === -1) throw new GameError("No current player");
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Returns the state of the game
     * @returns The state of the game
     * @private
     */
    private get state(): GameState {
        if (!this.gd) return GameState.NOT_INITIALIZED;
        return this.gameData.state;
    }

    /**
     * Sets the state of the game
     * @param state - The state to set
     * @private
     */
    private set state(state: GameState) {
        if (!this.gd) throw new GameError("Game not initialized");
        this.gd.state = state;
    }

    /**
     * Returns the game id
     * @returns The game id
     * @private
     */
    private get gameId(): GameId {
        return this.gameData.gameId;
    }

    /**
     * Returns the current player index
     * @returns The current player index
     * @private
     */
    private get currentPlayerIndex(): number {
        return this.gameData.currentPlayerIndex;
    }

    /**
     * Sets the current player index
     * @param index - The index to set
     * @private
     */
    private set currentPlayerIndex(index: number) {
        if (!this.gd) throw new GameError("Game not initialized");
        this.gd.currentPlayerIndex = index;
    }

    /**
     * Returns the game handler
     * @returns The game handler
     * @throws {GameError} - Thrown if the game is not initialized
     */
    public getGameHandler(): GameHandler {
        if (!this.gameHandler) throw new GameError("Game not initialized");
        return this.gameHandler;
    }

    /**
     * Returns the game data privat
     * @returns The game data
     * @private
     */
    private get gameData() {
        if (!this.gd) throw new GameError("Game not initialized");
        return {
            ...this.gd,
            playerIds: this.players.map(player => player.getId()),
            players: this.players.map(player => ({
                name: player.getName(),
                playerId: player.getId()
            }))
        };
    }

    private randomizePlayerOrder(): void {
        this.players = Shuffle.fisherYatesShuffle(this.players);
    }

    /**
     * Returns the game data for subclasses
     * @returns The game data
     * @protected
     */
    protected getGameData(): GD {
        return this.gameData as GD;
    }

    /**
     * Subscribes to game events of this game instance. Use it to listen to events e.g. GAME_STARTED, PLAYER_JOINED, PLAYER_LEFT...
     * @param observerOrNext - The observer or next function to call when an event is emitted.
     * @param eventType - The type of event to subscribe to, default is all events.
     * @returns The subscription object.
     * @throws {GameError} - Thrown if the game is not initialized
     */
    public subscribe(observerOrNext?: Partial<Observer<Event<any, any>>> | ((value: Event<any, any>) => void), eventType: Events = Events.ALL): Subscription {
        if (!this.gameHandler) throw new GameError("Game not initialized - Dont use in constructor! Use the onInit() hook instead.");
        return this.gameHandler.subscribe(observerOrNext, eventType, this.gameId);
    }


}