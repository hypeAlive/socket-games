import {Server, Socket} from "socket.io";
import LoggingUtils from "../utils/LoggingUtils.js";
import {GameId, SOCKET_JOIN_ACCEPT, SOCKET_JOIN_ERROR, SocketJoin} from "socket-game-types";
import AuthUtil from "../utils/AuthUtil.js";
import {RoomNeeds} from "socket-game-types/src/websocket/room.type.js";
import BaseGame from "../base/BaseGame.js";

type SocketRoomData = {
    namespace: string,
    roomHash: string,
    hasPassword: boolean,
    hashedPassword?: string,
}

const LOGGER = LoggingUtils.createLogger("Room", "\x1b[36m");

export default class SocketRoom {

    private roomData: SocketRoomData;
    private socket: Server;

    constructor(roomData: SocketRoomData, socket: Server) {
        this.roomData = roomData;
        this.socket = socket;
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

    private get needsPassword(): boolean {
        return this.roomData.hasPassword && !!this.roomData.hashedPassword;
    }

    public join(client: any, data: SocketJoin): boolean {
        if(this.needsPassword && this.roomData.hashedPassword) {
            if(!data.password || !AuthUtil.verifyPassword(this.roomData.hashedPassword, data.password)) {
                client.emit(SOCKET_JOIN_ERROR, "Invalid password");
                return false;
            }
        }
        client.join(this.roomData.roomHash);
        client.emit(SOCKET_JOIN_ACCEPT, this.roomData.roomHash);
        LOGGER.debug(`Client joined room ${this.roomData.roomHash} 👤`);
        return true;
    }

}