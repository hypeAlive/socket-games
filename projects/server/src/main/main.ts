import GameHandler from "./base/GameHandler.js";
import express from "express";
import TikTakToeGame from "./games/TikTakToeGame.js";
import LoggingUtils from "./utils/LoggingUtils.js";
import {createServer} from "http";
import GameSocketManager from "./websocket/GameSocketManager.js";
import DartGame from "./games/DartGame.js";
import {router as apiRouter} from "./api/api.js";
import cors from "cors";
import AuthUtil from "./utils/AuthUtil.js";

const LOGGER = LoggingUtils.createLogger("Server", "\x1b[34m");

const PORT = 7070;

const app = express();
app.set('case sensitive routing', false);
app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.options('*', cors());

LOGGER.info("Starting server... 👑❤️");
const http = createServer(app);

LOGGER.debug("Starting game handler...");
const gameHandler = new GameHandler();
export const socketManager = new GameSocketManager(http, gameHandler);

app.use("/api", apiRouter);

const password = "Hallo123";

LOGGER.info("test jwt with " + password);

const hash = AuthUtil.hashPassword(password);

LOGGER.info("hashed " + hash);

LOGGER.info("verify " + AuthUtil.verifyPassword(hash, password));

LOGGER.debug("Registering games...");
gameHandler.register(TikTakToeGame.GAME_TYPE);
gameHandler.register(DartGame.GAME_TYPE);

http.listen(PORT, () => {
    LOGGER.info(`Server started on port ${PORT} 🚀`);
});