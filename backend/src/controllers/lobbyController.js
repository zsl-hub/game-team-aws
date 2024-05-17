const express = require("express");
const router = express.Router();
const {createLobby, getLobbyById, getLobbyByName, getAllLobbies, getAllItems, updateItem, deleteLobby, createPlayer} = require("../repositories/lobbyRepository");

router.get("/", async (req, res) => {
    try {
        const allLobbies = await getAllItems('lobby');
        const waitingLobbies = allLobbies.Items.filter(item => item.lobbyStatus === 'waiting');

        res.json(waitingLobbies)
    }
    catch (error) {
        console.error("Error while getting all lobbies:", error);
        res.status(500).json({ error: "An error occurred while getting all lobbies" }); 
    }
});

router.post("/joinLobby", async (req, res) => {
    try {
        const getLobby = await getLobbyByName(req.body.lobbyName);
        if (getLobby.lobbyStatus === "waiting") {
            if (!getLobby.Pass || req.body.lobbyPass === getLobby.lobbyPass) {
                const player = await createPlayer(req.body.player2, false);
                req.body.player2 = player.playerId;
                updateItem("lobby",{ "lobbyId": getLobby.lobbyId}, { "player2": req.body.player2, "lobbyStatus": "playing"});
                res.status(200).json({ success: true, message: "Joined lobby successfully", lobbyId: getLobby.lobbyId, player2: req.body.player2 });
            } else {
                res.status(401).json({ success: false, message: "Incorrect lobby password" });
            }
        } else {
            res.status(403).json({ success: false, message: "Lobby is full" }); 
        }
    } catch (error) {
        console.error("Error while getting lobby:", error);
        res.status(500).json({ success: false, message: "An error occurred while getting lobby" });
    }
});

router.post("/createLobby", async (req, res) => {
    try {
        const player = await createPlayer(req.body.player1, false);
<<<<<<< HEAD
        req.body.player1 = player.playerId;
=======
        req.body.player1 = player;
>>>>>>> ef331b278eb9b99a338687d9c8ef5fc61f2a4f21
        const newLobby = await createLobby(req.body);
        res.status(201).json(newLobby); 
    } catch (error) {
        console.error("Error while creating lobby:", error);
        res.status(500).json({ error: "An error occurred while creating the lobby" }); 
    }
});

router.get("/lobbyList", async (req, res) => {
    try {
<<<<<<< HEAD
        const lobbyList = await getAllItems('lobby');
=======
        const lobbyList = await getAllLobbies();
>>>>>>> ef331b278eb9b99a338687d9c8ef5fc61f2a4f21
        res.json(lobbyList);
    }
    catch (error) {
        console.error("Error while getting all lobbies:", error);
        res.status(500).json({ error: "An error occurred while joining the lobby" });
    }
});

module.exports = router;
