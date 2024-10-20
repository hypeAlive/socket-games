import {Events, GameId, PlayerId} from "socket-game-types";
import {Subscription} from "rxjs";
import {Server} from "socket.io";
import GameHandler from "../base/GameHandler.js";
import LoggingUtils from "../utils/LoggingUtils.js";

const LOGGER = LoggingUtils.createLogger("Socket", "\x1b[35m");

export default class GameSocketManager {

    private readonly clientGamePlayerMap = new Map<string, PlayerId | undefined>();
    private readonly roomSubs = new Map<string, Subscription[]>();
    private readonly io: Server;
    private readonly gameHandler: GameHandler;

    constructor(http: any, gameHandler: GameHandler) {
        this.gameHandler = gameHandler;
        this.io = new Server(http);

        this.io.of('socket').on("connection", (socket) => this.handleConnection(socket));

        LOGGER.info("Socket manager initialized 🕹️");
    }

    private handleConnection(socket: any) {
        LOGGER.info("Client connected " + this.io.of('socket').sockets.size + " 👤");
        this.clientGamePlayerMap.set(socket.id, undefined);

        socket.on("join", (data:any) => this.handleJoin(socket, data));
        socket.on("action", (action:any) => this.handleAction(socket, action));
        socket.on("leave", () => this.handleLeave(socket));
        socket.on("start", () => this.handleStart(socket));
        socket.on("disconnect", () => this.handleDisconnect(socket));
    }

    private handleJoin(socket: any, {namespace, gameId}: {namespace: string, gameId?: GameId}) {
        try {
            if (Array.from(socket.rooms).length > 1) {
                socket.emit("error", {message: "You are already in a room."});
                return;
            }

            if (!gameId) {
                gameId = this.gameHandler.create(namespace).getId();
                LOGGER.debug(`Created new game ${this.gameIDToString(gameId)} 🎮`);
                this.subscribeToGameEvents(gameId);
            }

            const player = this.gameHandler.createPlayerId(gameId);
            const gameIdString = this.gameIDToString(gameId);
            socket.join(gameIdString);

            setTimeout(() => {
                if(!gameId) {
                    socket.leave(gameIdString);
                    throw new Error("GameId not found");
                }
                this.clientGamePlayerMap.set(socket.id, player);
                this.gameHandler.join(gameId, player);
                LOGGER.debug(`Player ${player[1]} joined game ${gameId[0]}-${gameId[1]} 👤`);
            }, 0);
        } catch (e: any) {
            socket.emit("error", {message: e.message});
        }
    }

    private handleAction(socket: any, action: any) {
        const playerId = this.getPlayerId(socket);
        if (!playerId) {
            socket.emit("error", {message: "not in a game"});
            return;
        }
        try {
            const gameId = playerId[0];
            this.gameHandler.sendAction(gameId, playerId, action);
        } catch (e: any) {
            socket.emit("error", {message: e.message});
        }
    }

    private handleLeave(socket: any) {
        const playerId = this.getPlayerId(socket);
        if (!playerId) {
            socket.emit("error", {message: "not in a game"});
            return;
        }
        try {
            const gameId = playerId[0];
            this.gameHandler.leave(playerId);
            socket.leave(this.gameIDToString(gameId));
            this.checkAndCleanUpRoom(this.gameIDToString(gameId), gameId);
            this.clientGamePlayerMap.delete(socket.id);

            LOGGER.debug(`Player ${playerId[1]} left game ${gameId[0]}-${gameId[1]} 👤`);
        } catch (e: any) {
            socket.emit("error", {message: e.message});
        }
    }

    private handleStart(socket: any) {
        const playerId = this.getPlayerId(socket);
        if (!playerId) {
            socket.emit("error", {message: "not in a game"});
            return;
        }
        try {
            const gameId = playerId[0];
            this.gameHandler.start(gameId);
        } catch (e: any) {
            socket.emit("error", {message: e.message});
        }
    }

    private handleDisconnect(socket: any) {
        const playerId = this.getPlayerId(socket);
        if (playerId) {
            this.gameHandler.leave(playerId);
            socket.leave(this.gameIDToString(playerId[0]));
            this.checkAndCleanUpRoom(this.gameIDToString(playerId[0]), playerId[0]);
        }
        this.clientGamePlayerMap.delete(socket.id);

        LOGGER.info("Client disconnected " + this.io.sockets.sockets.size + " 👤");
    }

    private subscribeToGameEvents(gameId: GameId) {
        const eventSub = this.gameHandler.subscribe((event) => {
            if (event.type === Events.PLAYER_DATA_CHANGED) {
                const playerId = event.playerId;
                if (!playerId) {
                    LOGGER.warn("PlayerId of Player not found");
                    return;
                }
                const socketId = this.getSocketIdFromPlayerId(playerId);
                if (!socketId) {
                    LOGGER.warn("SocketId of Player not found");
                    return;
                }
                this.io.to(socketId).emit("game-events", event);
                return;
            }
            this.io.to(this.gameIDToString(gameId)).emit("game-events", event);
        }, Events.ALL, gameId);
        this.roomSubs.set(this.gameIDToString(gameId), [eventSub]);
    }

    private checkAndCleanUpRoom(room: string, gameId: GameId) {
        const clients = this.io.sockets.adapter.rooms.get(room);
        const subscriptions = this.roomSubs.get(room);
        if (!clients || clients.size === 0) {
            subscriptions?.forEach(sub => sub.unsubscribe());
            this.roomSubs.delete(room);
            this.gameHandler.deleteGame(gameId);
            LOGGER.debug(`Room ${room} cleaned up 🧹`);
        }
    }

    private getPlayerId(socket: any): PlayerId | undefined {
        return this.clientGamePlayerMap.get(socket.id);
    }

    private gameIDToString(gameId: GameId): string {
        return `${gameId[0]}-${gameId[1]}`;
    }

    private getSocketIdFromPlayerId(playerId: PlayerId): string | undefined {
        for (const [socketId, id] of this.clientGamePlayerMap.entries()) {
            if (id && id[0][0] === playerId[0][0] && id[0][1] === playerId[0][1] && id[1] === playerId[1]) {
                return socketId;
            }
        }
        return undefined;
    }
}