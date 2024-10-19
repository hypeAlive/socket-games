import BaseGame from "../base/BaseGame.js";
import { PlayerData, ConnectFourAction, ConnectFourGameData } from "socket-game-types";
import GamePlayer from "../base/GamePlayer.js";
import { GameType } from "../types/base/game.type.js";
import { ConnectFourNamespace as NAMESPACE } from "socket-game-types";
import { GameError } from "../base/GameError.js";

export default class ConnectFourGame extends BaseGame<PlayerData, ConnectFourGameData, ConnectFourAction> {

    public static readonly GAME_TYPE: GameType<PlayerData, ConnectFourGameData, ConnectFourAction> = {
        namespace: NAMESPACE,
        creation: () => new ConnectFourGame()
    }

    private static readonly MAX_PLAYERS = 2;
    private static readonly MIN_PLAYERS = 2;

    constructor() {
        super(ConnectFourGame.MIN_PLAYERS, ConnectFourGame.MAX_PLAYERS);
    }

    /**
     * Checks if a player has won the game
     * @returns {GamePlayer<PlayerData> | null} The player that won the game or null if no player has won
     * @protected
     */
    protected checkWinCondition(): GamePlayer<PlayerData> | null {
        const board = this.getGameData().board;

        for (let x = 0; x < 7; x++) {
            const column = board[x];
            for (let y = 0; y < column.length; y++) {

                const currentGameBoardField = column[y];
                if (currentGameBoardField === null) continue;

                // Check vertical
                if (y < 3) {
                    if (currentGameBoardField === board[x][y + 1] && currentGameBoardField === board[x][y + 2] && currentGameBoardField === board[x][y + 3]) {
                        return this.players.find(player => player === (board[x][y] ? this.players[0] : this.players[1])) || null;
                    }
                }

                // Check horizontal
                if (x < 4) {
                    if (currentGameBoardField === board[x + 1][y] && currentGameBoardField === board[x + 2][y] && currentGameBoardField === board[x + 3][y]) {
                        return this.players.find(player => player === (board[x][y] ? this.players[0] : this.players[1])) || null;
                    }
                }

                // Check diagonal upwards
                if (x < 4 && y < 3) {
                    if (currentGameBoardField === board[x + 1][y + 1] && currentGameBoardField === board[x + 2][y + 2] && currentGameBoardField === board[x + 3][y + 3]) {
                        return this.players.find(player => player === (board[x][y] ? this.players[0] : this.players[1])) || null;
                    }
                }

                // Check diagonal downwards
                if (x < 4 && y > 2) {
                    if (currentGameBoardField === board[x + 1][y - 1] && currentGameBoardField === board[x + 2][y - 2] && currentGameBoardField === board[x + 3][y - 3]) {
                        return this.players.find(player => player === (board[x][y] ? this.players[0] : this.players[1])) || null;
                    }
                }
		
            }
        }

        return null;
    }

    /**
     * Initializes the game data with the game board
     * @protected
     */
    protected onInit(): void {
        this.setShuffleBeforeStart(false);
        this.setInitialGameData({
            board: this.generateBoard(),
        });
    }

    /**
     * Called when a player makes a move
     * @param player - The player that made the move
     * @param action - The action the player made
     * @protected
     */
    protected onPlayerAction(player: GamePlayer<PlayerData>, action: ConnectFourAction): boolean {
        if (!this.isPlayerActionValid(action)) throw new GameError("Invalid action");

        const {x} = action as ConnectFourAction;

        this.board[x][this.getFreeColumnIndex(x)] = player === this.players[0];

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
     * Generates a new connect four game board
     * @returns {boolean[][]} The generated game board
     * @private
     */
    private generateBoard(): (boolean | null)[][] {
        return Array(7).fill(null).map(() => Array(6).fill(null));
    }

    /**
     * Checks if a player action is valid
     * @param action - The action to check
     * @private
     */
    private isPlayerActionValid(action: ConnectFourAction): boolean {
        const {x} = action as ConnectFourAction;

        return x >= 0 && x < 7 && (this.getFreeColumnIndex(x) !== -1);
    }

    /**
     * Checks if a column is free
     * @param column - The column to check
     * @returns {number} -1 if the column is not free, the index of the free column otherwise
     * @private
     */
    private getFreeColumnIndex(column: number): number {
        for (let i = 0; i < 6; i++) {
            if (this.board[column][i] === null) {
                return i;
            }
        }

        return -1;
    }
}