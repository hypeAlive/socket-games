import {
    Events,
    GameId, PlayerAction,
    PlayerId,
    SOCKET_DISCONNECT, SOCKET_GAME_ACTION, SOCKET_GAME_RECREATE,
    SOCKET_GAME_START,
    SOCKET_JOIN,
    SOCKET_MESSAGE,
    SocketJoin
} from "socket-game-types";
import {Subscription} from "rxjs";
import {Server} from "socket.io";
import GameHandler from "../base/GameHandler.js";
import LoggingUtils from "../utils/LoggingUtils.js";
import SocketRoom from "./SocketRoom.js";
import UniqueId from "../utils/UniqueId.js";
import AuthUtil from "../utils/AuthUtil.js";

const LOGGER = LoggingUtils.createLogger("Socket", "\x1b[35m");

export default class GameSocketManager {

    private readonly clientGamePlayerMap = new Map<string, PlayerId | undefined>();
    private readonly roomSubs = new Map<string, Subscription[]>();
    private readonly rooms = new Map<string, SocketRoom>();
    private readonly clientRoomMap = new Map<string, string>();
    private readonly io: Server;
    private readonly gameHandler: GameHandler;

    constructor(http: any, gameHandler: GameHandler) {
        this.gameHandler = gameHandler;
        this.io = new Server(http, {
            cors: {
                origin: "*",
            }
        });

        this.io.of('socket').on("connection", (socket) => this.handleConnection(socket));

        LOGGER.info("Socket manager initialized 🕹️");
    }

    public roomExists(hash: string): SocketRoom | undefined {
        return this.rooms.get(hash);
    }

    public createRoom(nameSpace: string, password: string | undefined = undefined): string | undefined {

        if(!this.gameHandler.isRegistered(nameSpace)) return undefined;

        const uniqueId = UniqueId.generateUniqueHash(5, this.rooms.keys());

        const room = new SocketRoom({
            namespace: nameSpace,
            roomHash: uniqueId,
            hasPassword: !!password,
            hashedPassword: password ? AuthUtil.hashPassword(password) : undefined
        }, this.io, this.gameHandler);
        this.rooms.set(uniqueId, room);

        LOGGER.info(`Created new room with hash ${uniqueId} 🔒`);

        setTimeout(() => {
            this.cleanRoom(room);
        }, 30000);

        return uniqueId;
    }

    public getRoom(hash: string): SocketRoom | undefined {
        return this.rooms.get(hash);
    }

    private cleanRoom(room: SocketRoom) {
        if(room.clients().length > 0) return;

        this.rooms.delete(room.getHash());
        LOGGER.debug(`Room ${room.getHash()} cleaned up 🧹`);
    }

    private handleConnection(client: any) {
        LOGGER.info("Client connected " + this.io.of('socket').sockets.size + " 👤");
        this.clientGamePlayerMap.set(client.id, undefined);

        client.on(SOCKET_JOIN, (data:any) => this.handleJoin(client, data));
        client.on(SOCKET_GAME_ACTION, (action:PlayerAction) => this.handleAction(client, action));
        client.on("leave", () => this.handleLeave(client));
        client.on(SOCKET_GAME_RECREATE, () => this.handleRecreate(client));
        client.on(SOCKET_GAME_START, () => this.handleStart(client));
        client.on(SOCKET_MESSAGE, (message: string) => this.handleMessage(client, message));
        client.on(SOCKET_DISCONNECT, () => this.handleDisconnect(client));

        setTimeout(() => {
            if (Array.from(client.rooms).length === 1) {
                client.disconnect();
            }
        }, 30000);
    }

    private handleMessage(client: any, message: string) {
        const roomHash = this.clientRoomMap.get(client.id);
        if(!roomHash) return;
        const room = this.rooms.get(roomHash);
        if(!room) return;
        room.message(client, message);
    }

    private handleJoin(client: any, data: SocketJoin) {
        try {
            if (Array.from(client.rooms).length > 1) {
                client.emit("error", {message: "You are already in a room."});
                return;
            }

            if(!data || !data.hash) {
                client.emit("error", {message: "Invalid data."});
                return;
            }

            let room = this.rooms.get(data.hash);

            if (!room) {
                client.emit("error", {message: "Room not found."});
                return;
            }

            if(!room.join(client, data)) return;
            this.clientRoomMap.set(client.id, data.hash);

            /*

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
             */
        } catch (e: any) {
            client.emit("error", {message: e.message});
        }
    }

    private handleAction(client: any, action: PlayerAction) {
        const roomHash = this.clientRoomMap.get(client.id);
        if(!roomHash) return;
        const room = this.rooms.get(roomHash);
        if(!room) return;
        room.action(client, action);
    }

    private handleRecreate(client: any) {
        const roomHash = this.clientRoomMap.get(client.id);
        if(!roomHash) return;
        const room = this.rooms.get(roomHash);
        if(!room) return;
        LOGGER.debug(`Recreating game for room ${room.getHash()} 🎮`);
        room.createGame(client);
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

    private handleStart(client: any) {
        const roomHash = this.clientRoomMap.get(client.id);
        if(!roomHash) return;
        const room = this.rooms.get(roomHash);
        if(!room) return;
        room.start(client);
        /*
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

         */
    }

    private handleDisconnect(client: any) {
        LOGGER.info("Client disconnected " + this.io.sockets.sockets.size + " 👤");
        const roomHash = this.clientRoomMap.get(client.id);

        if(!roomHash) return;
        const room = this.rooms.get(roomHash);
        if(!room) return;
        room.leave(client);
        this.cleanRoom(room);


        /*
        const playerId = this.getPlayerId(socket);
        if (playerId) {
            this.gameHandler.leave(playerId);
            socket.leave(this.gameIDToString(playerId[0]));
            this.checkAndCleanUpRoom(this.gameIDToString(playerId[0]), playerId[0]);
        }
        this.clientGamePlayerMap.delete(socket.id);


         */
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