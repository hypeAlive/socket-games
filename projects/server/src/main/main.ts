import GameHandler from "./base/GameHandler.js";
import TikTakToeGame from "./games/TikTakToeGame.js";
import LoggingUtils from "./utils/LoggingUtils.js";
import {createServer} from "http";
import GameSocketManager from "./websocket/GameSocketManager.js";
import DartGame from "./games/DartGame.js";

const LOGGER = LoggingUtils.createLogger("Server", "\x1b[34m");

const PORT = 7070;

LOGGER.info("Starting server... 👑❤️");
const http = createServer();

LOGGER.debug("Starting game handler...");
const gameHandler = new GameHandler();
new GameSocketManager(http, gameHandler);

LOGGER.debug("Registering games...");
gameHandler.register(TikTakToeGame.GAME_TYPE);
gameHandler.register(DartGame.GAME_TYPE);

http.listen(PORT, () => {
    LOGGER.info(`Server started on port ${PORT} 🚀`);
});