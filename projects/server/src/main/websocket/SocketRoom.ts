import {Server, Socket} from "socket.io";
import LoggingUtils from "../utils/LoggingUtils.js";
import {
    createSystemYouAre,
    Events,
    GameId,
    PlayerId, SOCKET_DISCONNECT,
    SOCKET_GAME_EVENT,
    SOCKET_JOIN_ACCEPT,
    SOCKET_JOIN_ERROR, SOCKET_MESSAGE, SOCKET_SYSTEM_EVENT,
    SocketJoin, SocketMessage, SystemEvent, SystemYouAre
} from "socket-game-types";
import AuthUtil from "../utils/AuthUtil.js";
import {RoomNeeds} from "socket-game-types/src/websocket/room.type.js";
import GameHandler from "../base/GameHandler.js";
import {Subscription} from "rxjs";

type SocketRoomData = {
    namespace: string,
    roomHash: string,
    hasPassword: boolean,
    hashedPassword?: string,
}

type SocketUserData = {
    name: string,
    id: string,
    playerId?: PlayerId,
}

const LOGGER = LoggingUtils.createLogger("Room", "\x1b[36m");

export default class SocketRoom {

    private roomData: SocketRoomData;
    private socket: Server;
    private gameHandler: GameHandler;
    private game: GameId | undefined;
    private eventSub: Subscription | undefined;
    private endSub: Subscription | undefined;
    private clientIdDataMap: Map<string, SocketUserData> = new Map();
    private roomOwnerClientId: string | undefined;


    constructor(roomData: SocketRoomData, socket: Server, gameHandler: GameHandler) {
        this.roomData = roomData;
        this.socket = socket;
        this.gameHandler = gameHandler;
        this.createGame();
    }

    public clients(): string[] {
        const clientsSet = this.socket.of('socket').adapter.rooms.get(this.roomData.roomHash);
        return clientsSet ? Array.from(clientsSet) : [];
    }

    public getNeeds(): RoomNeeds {
        return {
            namespace: this.roomData.namespace,
            password: this.needsPassword
        }
    }

    private createGame() {
        if (this.game) return;
        this.game = this.gameHandler.create(this.roomData.namespace).getId();

        this.endSub = this.gameHandler.subscribe(() => {
            this.cleanUpGame();
        }, Events.GAME_ENDED, this.game);

        this.eventSub = this.gameHandler.subscribe((event) => {
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
                this.sendEventToClient(event, socketId);

                return;
            }
            this.sendEventToRoom(event);
        }, Events.ALL, this.game);
        if (Array.of(this.clientIdDataMap.keys()).length >= 0) return;

        this.clientIdDataMap.forEach((data) => {
            this.joinGame(data.id);
        });
    }

    private getSocketIdFromPlayerId(playerId: PlayerId): string | undefined {
        for (const [socketId, data] of this.clientIdDataMap.entries()) {
            LOGGER.debug(data.playerId + " " + playerId);
            if (data.playerId && data.playerId[0] === playerId[0] && data.playerId[1] === playerId[1]) {
                return socketId;
            }
        }
    }

    public message(client: any, message: string) {
        const name = this.clientIdDataMap.get(client.id)?.name;
        if (!name) return;
        this.sendMessage(name, message, AuthUtil.hashClientId(client.id));
    }

    private sendMessage(sender: string, message: string, senderId: string = "sys") {
        this.socket.of('socket')
            .to(this.roomData.roomHash)
            .emit(SOCKET_MESSAGE, {
                sender: sender,
                senderId: senderId,
                message: message,
                timestamp: new Date().getTime()
            } as SocketMessage);
    }

    public sendSystemMessage(message: string) {
        this.sendMessage("System", message);
    }

    public cleanUpGame() {
        this.clientIdDataMap.forEach((data) => {
            this.leaveGame(data.id);
        });
        if (this.game) {
            this.game = undefined;
        }
        if (this.eventSub) {
            this.eventSub.unsubscribe();
            this.eventSub = undefined;
        }
        if (this.endSub) {
            this.endSub.unsubscribe();
            this.endSub = undefined;
        }
    }

    private joinGame(clientId: string) {
        if (!this.game)
            throw new Error("Game not created");

        const clientData = this.clientIdDataMap.get(clientId);
        if (!clientData)
            throw new Error("Client data not found");

        const playerId = this.gameHandler.createPlayerId(this.game);

        this.clientIdDataMap.set(clientId, {
            ...clientData,
            playerId: playerId
        });

        this.gameHandler.join(this.game, clientData.name, playerId);

    }

    private leaveGame(clientId: string) {
        if (!this.game)
            throw new Error("Game not created");

        const clientData = this.clientIdDataMap.get(clientId);
        if (!clientData)
            throw new Error("Client data not found");

        if (!clientData.playerId) return;

        this.gameHandler.leave(clientData.playerId);
        this.clientIdDataMap.set(clientId, {
            ...clientData,
            playerId: undefined
        });
    }

    private get needsPassword(): boolean {
        return this.roomData.hasPassword && !!this.roomData.hashedPassword;
    }

    private sendEventToClient(data: any, socketId: string) {
        this.socket.of('socket')
            .to(socketId)
            .emit(SOCKET_GAME_EVENT, data);
    }

    private sendEventToRoom(data: any) {
        this.socket.of('socket').to(this.roomData.roomHash).emit(SOCKET_GAME_EVENT, data);
    }

    public join(client: any, data: SocketJoin): boolean {
        if (this.needsPassword && this.roomData.hashedPassword) {
            if (!data.password || !AuthUtil.verifyPassword(this.roomData.hashedPassword, data.password)) {
                client.emit(SOCKET_JOIN_ERROR, "Invalid password");
                return false;
            }
        }

        client.join(this.roomData.roomHash);
        try {
            this.setClientData(client, data);
            this.joinGame(client.id);
        } catch (e) {
            client.leave(this.roomData.roomHash);
            this.removeClientData(client.id);
            client.emit(SOCKET_JOIN_ERROR, e);
            return false;
        }
        client.emit(SOCKET_JOIN_ACCEPT, this.roomData.roomHash);
        const youAre = createSystemYouAre(data.name, AuthUtil.hashClientId(client.id), false);


        this.sendSystemMessage(`${data.name} joined the room 👤`);
        LOGGER.debug(`Client joined room ${this.roomData.roomHash} 👤`);

        if (!this.roomOwnerClientId) {
            this.roomOwnerClientId = client.id;
            this.sendSystemMessage(`${data.name} is now the room owner 👑`);
            youAre.owner = true;
        }

        this.sendSystemEvent(client.id, youAre);

        return true;
    }

    private sendSystemEvent(socketId: string, event: SystemEvent) {
        this.socket.of('socket')
            .to(socketId)
            .emit(SOCKET_SYSTEM_EVENT, event);
    }

    private removeClientData(clientId: string) {
        const data = this.clientIdDataMap.get(clientId);
        if(!data) return undefined;
        this.clientIdDataMap.delete(clientId);
        LOGGER.debug(`Client data removed for ${clientId} 🗑`);
        return data;
    }

    public leave(client: any) {
        try {
            this.leaveGame(client.id);
            const data = this.removeClientData(client.id);
            if(data) {
                this.sendSystemMessage(`${data.name} left the room 👤`);
            }
            if (client.id === this.roomOwnerClientId) {
                this.roomOwnerClientId = this.findNewOwner();
                if (!this.roomOwnerClientId) return;
                const data = this.clientIdDataMap.get(this.roomOwnerClientId);
                if(!data) return;
                this.sendSystemMessage(`${data.name} is now the room owner 👑`);
                this.sendSystemEvent(this.roomOwnerClientId, createSystemYouAre(data.name, AuthUtil.hashClientId(data.id), true));
            }
        } catch (e) {
            LOGGER.error(e);
        }
    }

    private findNewOwner() {
        const firstClientId = this.clientIdDataMap.keys().next().value;
        return firstClientId ? firstClientId : undefined;
    }

    private setClientData(client: any, data: SocketJoin) {
        if (this.clientIdDataMap.has(client.id)) return;
        this.clientIdDataMap.set(client.id, {
            name: data.name,
            id: client.id,
        });
        LOGGER.info(`Client data set for ${client.id} 📝`);
        LOGGER.debug(this.clientIdDataMap.get(client.id));
    }

    public getHash(): string {
        return this.roomData.roomHash;
    }

}