export type SocketJoin = {
    name: string,
    hash: string,
    password?: string
}

export type SocketMessage = {
    message: string,
    senderId: string,
    sender: string
    timestamp: number
}

export type SystemEvent = {
    type: SYSTEM_EVENT_TYPE,
}

export interface SystemYouAre extends SystemEvent {
    name: string
    id: string
    owner: boolean
}

export type SYSTEM_EVENT_TYPE = "youare";

export function isSystemYouAre(event: SystemEvent): event is SystemYouAre {
    return event.type === "youare";
}

export function createSystemYouAre(name: string, id: string, owner: boolean): SystemYouAre {
    return {
        type: "youare",
        name: name,
        id: id,
        owner: owner
    }
}

export const SOCKET_JOIN = "join";
export const SOCKET_JOIN_ACCEPT = "join-accept";
export const SOCKET_JOIN_ERROR = "join-error";

export const SOCKET_GAME_EVENT = "game-event";

export const SOCKET_DISCONNECT = "disconnect";

export const SOCKET_MESSAGE = "message";

export const SOCKET_SYSTEM_EVENT = "system-event";