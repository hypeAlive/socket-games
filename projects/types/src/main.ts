import {Event, Events, GameEvent, BaseEvent, PlayerEvent} from "./base/event.type.js";
import {GameId, GameState, GameData} from "./base/game.type.js";
import {PlayerId, PlayerAction, PlayerData} from "./base/player.type.js";

import {NamespaceID, isNamespaceID, ID} from "./util/id.type.js";

import {TikTakToeAction, TikTakToeGameData, TikTakToeNamespace} from "./games/tiktaktoe.type.js";
import {DartAction, DartGameData, DartNamespace, DartField} from "./games/dart.type.js";
import {BowlingAction, BowlingGameData, BowlingNamespace} from "./games/bowling.type.js";
import {ConnectFourAction, ConnectFourGameData, ConnectFourNamespace} from "./games/connectfour.type.js";

import {ApiCreateGame, ApiGameHash} from "./api/game.type.js";
import {SocketJoin, SOCKET_JOIN, SOCKET_JOIN_ACCEPT, SOCKET_JOIN_ERROR, SOCKET_DISCONNECT} from "./websocket/socket.type.js";


export {Event, Events, BaseEvent, GameEvent, PlayerEvent};
export {GameId, GameState, GameData};
export {PlayerId, PlayerAction, PlayerData};

export {NamespaceID, isNamespaceID, ID};

export {TikTakToeAction, TikTakToeGameData, TikTakToeNamespace};
export {DartAction, DartGameData, DartNamespace, DartField};
export {BowlingAction, BowlingGameData, BowlingNamespace};
export {ConnectFourAction, ConnectFourGameData, ConnectFourNamespace};

export {ApiCreateGame, ApiGameHash};
export {SocketJoin, SOCKET_JOIN, SOCKET_JOIN_ERROR, SOCKET_JOIN_ACCEPT, SOCKET_DISCONNECT};
