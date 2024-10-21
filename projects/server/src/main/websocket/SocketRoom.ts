import {Server, Socket} from "socket.io";
import LoggingUtils from "../utils/LoggingUtils.js";
import {SOCKET_JOIN_ACCEPT, SOCKET_JOIN_ERROR, SocketJoin} from "socket-game-types";

type SocketRoomData = {
    roomHash: string,
    hasPassword: boolean,
    password?: string,
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

    join(client: any, data: SocketJoin): boolean {
        if(this.roomData.hasPassword) {
            if(!data.password || data.password !== this.roomData.password) {
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