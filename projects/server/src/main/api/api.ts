import express from "express";
import {socketManager} from "../main.js";
import {ApiCreateGame, ApiGameHash} from "socket-game-types";
import SocketRoom from "../websocket/SocketRoom.js";

export const router = express.Router();

router.get("/", (req, res) => {
    res.send("Games API");
});

router.post("/create", (req, res) => {
    const data: ApiCreateGame = req.body;

    console.log(data);

    if(!data || !data.namespace || data.hasPassword === undefined || (data.hasPassword && !data.password)) {
        res.status(400).send("Invalid data");
        return
    }

    const hash = socketManager.createRoom(data.namespace, data.password);

    if(!hash) {
        res.status(400).send("Invalid namespace");
        return;
    }

    res.send({hash: hash} as ApiGameHash);
});

router.get('/exists/:hash', (req, res) => {
    const hash = req.params.hash;

    if (checkRoomExists(hash, res)) {
        res.status(200).send("Room found");
    }
});

router.get('/needs/:hash', (req, res) => {
    const hash = req.params.hash;

    let room = checkRoomExists(hash, res);
    if (!room) {
        res.status(404).send("Room not found");
        return;
    }

    res.status(200).send(room.getNeeds());
});

const checkRoomExists = (hash: string, res: express.Response): SocketRoom | undefined => {
    if (!hash) {
        res.status(404).send("Invalid hash");
        return undefined;
    }

    const room = socketManager.roomExists(hash);

    if (!room) {
        res.status(404).send("Room not found");
        return undefined;
    }

    return room;
};