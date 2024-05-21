//dependencies
const Ably = require("ably");
const express = require("express");

//repositories
const { getItemById, updateItem } = require("../repositories/lobbyRepository.js");

//utils
const ShipUtil = require("../utility/ShipUtil.js");
const PlayerUtil = require("../utility/PlayerUtil.js");
const FieldUtil = require("../utility/FieldUtil.js");
const Stages = require("../utility/Stages.js");

const router = express.Router();

//constants
const PLAYERS_NEEDED_TO_START_GAME = 2;

function gameBackend()
{
    let globalChannel;
    let lobbies = {};

    const realtime = new Ably.Realtime({
        key: process.env.ABLY_API_KEY,
        echoMessages: false
    })

    router.get("/auth", (req, res) => {
        let clientId = req.query.playerId;
    
        const tokenParams = 
        {
            clientId: clientId,
            capability: { "*": ["publish", "subscribe", "presence"]}
        };
    
        realtime.auth.createTokenRequest(tokenParams)
            .then(tokenRequest => {
                res.json(tokenRequest);
            });
    })

    realtime.connection.once("connected", async () => {
        console.log("Connected to Ably!");

        globalChannel = realtime.channels.get("globalChannel");
        globalChannel.presence.subscribe("enter", (msg) => {
            handleConnectionEnter(msg);
        });
    })

    async function handleConnectionEnter(msg)
    {
        const lobbyId = msg.data.lobbyId;
        const playerId = msg.clientId;

        let lobbyDB = await getItemById("lobby", { "lobbyId": lobbyId });
        lobbyDB = lobbyDB.Item;

        if (!lobbyDB.player2 && lobbyDB.player1 !== playerId)
        {
            console.log("create player 2")
            await updateItem("lobby", { "lobbyId": lobbyId }, { "player2": playerId });
        }

        lobbyDB = await getItemById("lobby", { "lobbyId": lobbyId });
        lobbyDB = lobbyDB.Item;

        if (!lobbies[lobbyId])
        {   
            console.log("create lobby");
            await createLobby(lobbyDB);
        }

        if (lobbyDB.player1 !== playerId && lobbyDB.player2 !== playerId){

            console.log("return");
            return;
        }
        //if (lobbyDB.player1.playerId != playerId) return;
        const lobbyObj = lobbies[lobbyId];

        await PlayerUtil.handlePlayerEnter(realtime, lobbyObj, playerId);

        lobbyDB = await getItemById("lobby", { "lobbyId": lobbyId });
        lobbyDB = lobbyDB.Item;

        if (lobbyDB.game.connectedPlayers ===  PLAYERS_NEEDED_TO_START_GAME){
            const lobbyObj = lobbies[lobbyId];

            Stages.handleFirstStageStart(lobbyObj, lobbyDB, 
            () => {
                Stages.handleSecondStageStart(lobbyObj);
            });
        }
    }

    const createLobby = async (lobbyDB) =>
    {
        console.log("Create Lobby");

        lobbies[lobbyDB.lobbyId] = {
            lobbyId: lobbyDB.lobbyId,
            playerChannels: {}
        };

        let lobbyObj = lobbies[lobbyDB.lobbyId];

        lobbyObj.lobbyChannel = realtime.channels.get(`lobbyChannel-${lobbyObj.lobbyId}`);
        lobbyObj.lobbyChannel.attach();

        const game = {
            connectedPlayers: 0,
            readyPlayers: 0,
            ships: {},
            fields: {},
            shipsLeft: {}
        };

        await updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });
    }
}

module.exports = { 
    gameBackend,
    gameRouter: router
};
