export type SocketJoin = {
    name: string,
    hash: string,
    password?: string
}

export const SOCKET_JOIN = "join";
export const SOCKET_JOIN_ACCEPT = "join-accept";
export const SOCKET_JOIN_ERROR = "join-error";

export const SOCKET_GAME_EVENT = "game-event";

export const SOCKET_DISCONNECT = "disconnect";