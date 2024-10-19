import {Events, PlayerData, PlayerEvent, PlayerId} from "socket-game-types";
import BaseGame from "./BaseGame.js";

/**
 * Represents a player in a game.
 * @class
 * @template PD - The type of player data
 */
export default class GamePlayer<PD extends PlayerData> {

    private readonly game: BaseGame<PD, any, any>;
    private playerData: PD;

    /**
     * Create a new GamePlayer
     * @param playerId - The player's id
     * @param game - The game the player is in
     * @param initialPlayerData - The initial player data
     */
    constructor(playerId: PlayerId, game: BaseGame<PD, any, any>, initialPlayerData: Partial<PD> = {}) {
        this.playerData = {
            playerId: playerId
        } as PD;
        this.game = game;
        this.updatePlayerData(initialPlayerData);
    }

    /**
     * Get the player's data
     * You can not update the playerId
     * @throws {GameError} - Thrown if you try to update the playerId
     * @param playerData
     */
    public updatePlayerData(playerData: Partial<PD> = {}) {
        if(playerData.playerId) throw new Error("PlayerId can not be updated");
        this.playerData = {...this.playerData, ...playerData};

        this.game.getGameHandler().next({
            type: Events.PLAYER_DATA_CHANGED,
            playerId: this.getId(),
            gameId: this.game.getId(),
            data: this.playerData
        } as PlayerEvent<PD>);
    }

    /**
     * Get the player's data
     * @returns {PD} - The player's data
     */
    public getPlayerData(): PD {
        return this.playerData;
    }

    /**
     * Get the player id
     * @returns {PlayerId} - The player's id
     */
    public getId(): PlayerId {
        return this.playerData.playerId;
    }
}