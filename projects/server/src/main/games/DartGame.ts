import BaseGame from "../base/BaseGame.js";
import {
    DartAction, DartField,
    DartGameData,
    DartNamespace as NAMESPACE,
    Events,
    GameEvent,
    PlayerData,
    PlayerId
} from "socket-game-types";
import GamePlayer from "../base/GamePlayer.js";
import {GameType} from "../types/base/game.type.js";
import {Subscription} from "rxjs";
import {GameError} from "../base/GameError.js";
import {Optional} from "ts-optional";


export default class DartGame extends BaseGame<PlayerData, DartGameData, DartAction> {
    public static readonly GAME_TYPE: GameType<PlayerData, DartGameData, DartAction> = {
        namespace: NAMESPACE,
        creation: () => new DartGame()
    }

    private static readonly MAX_PLAYERS = 4;
    private static readonly MIN_PLAYERS = 1;
    private static readonly INITIAL_POINTS = 301;
    private static readonly MAX_THROWS = 3;

    constructor() {
        super(DartGame.MIN_PLAYERS, DartGame.MAX_PLAYERS);
    }

    protected checkWinCondition(): GamePlayer<PlayerData> | null {
        return this.players.find(player => this.getPoints(player.getId()) === 0) || null;
    }

    /**
     * Initializes the game with default game data.
     * This method is called when the game instance is created and sets the initial game data.
     * In this case, it initializes the game with an empty array of points.
     */
    protected onInit(): void {
        this.setInitialGameData({
            points: [],
            throw: -1
        });
        //Subscription object that listens for the `GAME_STARTED` event.
        let startSubscription: Subscription;
        startSubscription = this.subscribe((event: GameEvent<DartGameData>) => {
            const points: [player: PlayerId, points: number][] = [];
            event.data.playerIds.forEach(playerId => {
                points.push([playerId, DartGame.INITIAL_POINTS])
            });
            this.updateGameData({points: points, throw: 1})
        }, Events.GAME_STARTED);

        //Subscription object that listens for the `GAME_ENDED` event.
        let endSubscription: Subscription;
        endSubscription = this.subscribe(() => {
            startSubscription.unsubscribe();
            endSubscription.unsubscribe();
        }, Events.GAME_ENDED);
    }

    private playerPointBackup: number = -1;

    protected onPlayerAction(player: GamePlayer<PlayerData>, action: DartAction): boolean {

        const gameData = this.getGameData();

        if (gameData.throw === -1) throw new GameError("Game not initialized");
        if (gameData.throw === 1 && this.playerPointBackup !== -1) throw new GameError("Player has no backup points");
        const thrownPoints = this.getPointsFromDartField(action.field);
        if (!this.isValidField(thrownPoints)) throw new GameError("Invalid dart field");

        const playerPoints = this.getPoints(player.getId());

        if (gameData.throw === 1) {
            this.playerPointBackup = playerPoints;
        }

        let next: boolean = this.getGameData().throw === DartGame.MAX_THROWS;

        let newPoints: [player: PlayerId, points: number][];

        // is overthrown?
        if ((playerPoints - thrownPoints) < 0) {
            newPoints = this.setPoints(player.getId(), this.playerPointBackup, false);
            this.playerPointBackup = -1;
            next = true;
        } else {
            newPoints = this.setPoints(player.getId(), playerPoints - thrownPoints, false);
        }

        next = newPoints.some(([_, points]) => points === 0) || next;


        if (next) {
            this.updateGameData({points: newPoints, throw: 1}, false);
            this.playerPointBackup = -1;
        } else
            this.updateGameData({points: newPoints, throw: this.getGameData().throw + 1});

        return next;
    }

    /**
     * Returns the points of a player.
     * @param playerId The id of the player.
     * @returns The points of the player.
     * @throws GameError if the points are not initialized or the player is not found.
     * @private
     */
    private getPoints(playerId: PlayerId): number {
        if (!this.getGameData().points || this.getGameData().points.length === 0)
            throw new GameError("Points not initialized");
        if (playerId[0][0] !== NAMESPACE || playerId[0][1] !== this.getId()[1])
            throw new GameError("Invalid player id");
        return Optional.ofNullable(
            this.getGameData().points.find(([player, _]) => player[1] === playerId[1])
        )
            .map(([_, points]) => points)
            .orElseThrow("Player not found");
    }

    /**
     * Sets the points of a player.
     * @param playerId The id of the player.
     * @param points The points to set.
     * @param autoUpdate - auto update the points in the game data
     * @throws GameError if the points are not initialized or the player is not found.
     * @private
     */
    private setPoints(playerId: PlayerId, points: number, autoUpdate: boolean = true): [player: PlayerId, points: number][] {
        if (!this.getGameData().points || this.getGameData().points.length === 0)
            throw new GameError("Points not initialized");
        if (playerId[0][0] !== NAMESPACE || playerId[0][1] !== this.getId()[1])
            throw new GameError("Invalid player id");
        const pointsIndex = this.getGameData().points.findIndex(([player, _]) => player[1] === playerId[1]);
        if (pointsIndex === -1) throw new GameError("Player not found");

        // Check if the points to be set are less than 0, which is not allowed.
        if (points < 0) {
            throw new GameError("overthrown");
        }
        // Retrieve the current points list from the game data.
        const pointList = this.getGameData().points;


        pointList[pointsIndex][1] = points;
        // Update the game data with the new points list.
        if (autoUpdate)
            this.updateGameData({points: pointList});
        return pointList;

    }

    /**
     * Returns all possible dart fields.
     * @returns All possible dart fields.
     * @private
     */
    private getDartFields(): DartField[] {
        const dartFields: DartField[] = [];
        for (let field = 1; field <= 20; field++) {
            for (let multiplier = 1; multiplier <= 3; multiplier++) {
                dartFields.push({field, multiplier});
            }
        }
        dartFields.push({field: 25, multiplier: 1}); // Bull's Eye
        dartFields.push({field: 25, multiplier: 2}); // Bull
        return dartFields;
    }

    private getPointsFromDartField(field: DartField): number {
        return field.field * field.multiplier;
    }

    /**
     * Checks if the thrown points are valid.
     * @param points The points to check.
     * @returns True if the points are valid, false otherwise.
     */
    private isValidField(points: number): boolean {
        for (let multiplier = 1; multiplier <= 3; multiplier++) {
            const field = points / multiplier;
            if (Number.isInteger(field)) {
                const validFields = this.getDartFields();
                if (validFields.some(validField => validField.field === field && validField.multiplier === multiplier)) {
                    return true;
                }
            }
        }
        return false;
    }

}