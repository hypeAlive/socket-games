import express from "express";
import {socketManager} from "../main.js";
import {ApiCreateGame, ApiGameHash} from "socket-game-types";

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

    const hash = socketManager.createRoom();
    res.send({hash: hash} as ApiGameHash);

});

router.get('/exists/:hash', (req, res) => {
    const hash = req.params.hash;

    if(!hash) {
        res.status(400).send("Invalid hash");
        return;
    }

    const exists = socketManager.roomExists(hash);

    if(!exists) {
        res.status(404).send("Room not found");
    } else {
        res.status(200).send("Room found");
    }
});