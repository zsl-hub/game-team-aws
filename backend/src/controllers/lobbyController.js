const express = require("express");
const router = express.Router();
const {createItem, getItemById, getItemByProperty, getAllItems, updateItem, deleteLobby, createPlayer} = require("../repositories/lobbyRepository");
const { v4: uuidv4 } = require('uuid');
const { itemSchema, player2Schema, playerSchema } = require("../schemas");

router.get("/orangutan", async (req, res) => {
    try {
        res.json("HELLO, EVERYTHING IS WORKING JUST FINE!!!!!");
    }
    catch (error){
        console.error("Error while getting all lobbies:", error);
        res.status(401).json({ error: "An error occurred while getting all lobbies" }); 
    }
});

router.get("/", async (req, res) => {
    try {
        const allLobbies = await getAllItems('lobby');
        //const waitingLobbies = allLobbies.Items.filter(item => item.lobbyStatus === 'waiting');
        
        res.json(allLobbies)
    }
    catch (error) {
        console.error("Error while getting all lobbies:", error);
        res.status(500).json({ error: "An error occurred while getting all lobbies" }); 
    }
});
// asdnfidsafyf
// nasdufidabfuyafvasfuyvsdaydfafdaffafsaf
// rtest number sadiadsbuyfsf

router.post("/joinLobby", async (req, res) => {
    try {
        const getLobby = await getItemByProperty("lobby", { "lobbyName": req.body.lobbyName});
        if (getLobby.lobbyStatus === "waiting") {
            if (!getLobby.Pass || req.body.lobbyPass === getLobby.lobbyPass) {
                const { error: errorPlayer, value: valuePlayer } = playerSchema.validate({"playerName": req.body.player2, "isReady": false});
                if (errorPlayer) {
                    console.error("Validation error:", errorPlayer.details[0].message);   
                    throw new Error(errorPlayer.details[0].message);
                }
                const player = await createItem('player', {"playerId": uuidv4(), "playerName": valuePlayer.player2, "isReady": false})
                req.body.player2 = player.playerId;
                
                const { error, value } = player2Schema.validate({ "player2": req.body.player2, "lobbyStatus": "playing"})
                if (error) {
                    console.error("Validation error:", error.details[0].message);   
                    throw new Error(error.details[0].message);
                }
                updateItem("lobby", {"lobbyId": getLobby.lobbyId}, value);

                res.status(200).json({success: true, message: "Joined lobby successfully", lobbyId: getLobby.lobbyId, player2: req.body.player2}); 
            } else {
                res.status(401).json({success: false, message: "Incorrect lobby password"});
            } 
        } else {
            res.status(403).json({ success: false, message: "Lobby is full" }); 
        }
    } catch (error) {
        console.error("Error while getting lobby:", error);
        res.status(500).json({success: false, message: "An error occurred while getting lobby"});
    }
});

router.post("/createLobby", async (req, res) => {
    try {
        const { error: errorPlayer, value: valuePlayer } = playerSchema.validate({"playerName": req.body.player1, "isReady": false});
        if (errorPlayer) {
            console.error("Validation error:", errorPlayer.details[0].message);   
            throw new Error(errorPlayer.details[0].message);
        }
        const player = await createItem('player', {"playerId": uuidv4(), "playerName": valuePlayer.player1, "isReady": false });

        req.body.player1 = player.playerId;
        req.body.lobbyId = uuidv4();

        const { error, value } = itemSchema.validate(req.body);
        if (error) {
            console.error("Validation error:", error.details[0].message);   
            throw new Error(error.details[0].message);
        }
        const newLobby = await createItem('lobby', value);

        res.status(201).json(newLobby); 
    } catch (error) {
        console.error("Error while creating lobby:", error);
        res.status(500).json({error: "An error occurred while creating the lobby"}); 
    }
});

router.get("/lobbyList", async (req, res) => {
    try {
        const lobbyList = await getAllItems('lobby');
        res.json(lobbyList);
    }
    catch (error) {
        console.error("Error while getting all lobbies:", error);
        res.status(500).json({error: "An error occurred while joining the lobby"});
    }
});

module.exports = router;
