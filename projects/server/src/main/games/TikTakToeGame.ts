import BaseGame from "../base/BaseGame.js";
import {PlayerData, TikTakToeAction, TikTakToeGameData} from "socket-game-types";
import GamePlayer from "../base/GamePlayer.js";
import {GameType} from "../types/base/game.type.js";
import {TikTakToeNamespace as NAMESPACE} from "socket-game-types";
import {GameError} from "../base/GameError.js";

export default class TikTakToeGame extends BaseGame<PlayerData, TikTakToeGameData, TikTakToeAction> {

    public static readonly GAME_TYPE: GameType<PlayerData, TikTakToeGameData, TikTakToeAction> = {
        namespace: NAMESPACE,
        creation: () => new TikTakToeGame()
    }

    private static readonly MAX_PLAYERS = 2;
    private static readonly MIN_PLAYERS = 2;

    constructor() {
        super(TikTakToeGame.MIN_PLAYERS, TikTakToeGame.MAX_PLAYERS);
    }

    /**
     * Checks if a player has won the game
     * @returns {GamePlayer<PlayerData> | null} The player that won the game or null if no player has won
     * @protected
     */
    protected checkWinCondition(): GamePlayer<PlayerData> | null {
        const board = this.getGameData().board;

        for (let i = 0; i < 3; i++) {
            if (board[i][0] !== null && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
                return this.players.find(player => player === (board[i][0] ? this.players[0] : this.players[1])) || null;
            }
            if (board[0][i] !== null && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
                return this.players.find(player => player === (board[0][i] ? this.players[0] : this.players[1])) || null;
            }
        }

        if (board[0][0] !== null && board[0][0] === board[1][1] && board[1][1] === board[2][2] ||
            board[0][2] !== null && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            return this.players.find(player => player === (board[1][1] ? this.players[0] : this.players[1])) || null;
        }

        return null;
    }

    /**
     * Initializes the game data with the game board
     * @protected
     */
    protected onInit(): void {
        this.setInitialGameData({
            board: this.generateBoard(),
        });
        this.setShuffleBeforeStart(true);
    }

    /**
     * Called when a player makes a move
     * @param player - The player that made the move
     * @param action - The action the player made
     * @protected
     */
    protected onPlayerAction(player: GamePlayer<PlayerData>, action: TikTakToeAction): boolean {
        if (!this.isPlayerActionValid(action)) throw new GameError("Invalid action");

        const {x, y} = action as TikTakToeAction;

        this.board[x][y] = player === this.players[0];

        return true;
    }

    /**
     * Gets the game board
     * @private
     */
    private get board(): (boolean | null)[][] {
        return this.getGameData().board;
    }

    /**
     * Generates a new game board
     * @returns {boolean[][]} The generated game board
     * @private
     */
    private generateBoard(): (boolean | null)[][] {
        return Array(3).fill(null).map(() => Array(3).fill(null));
    }

    /**
     * Checks if a player action is valid
     * @param action - The action to check
     * @private
     */
    private isPlayerActionValid(action: TikTakToeAction): boolean {
        const {x, y} = action as TikTakToeAction;

        return x >= 0 && x < 3 && y >= 0 && y < 3 && this.board[x][y] === null;
    }

}