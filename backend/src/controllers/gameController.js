const Ably = require("ably");
const { get, getItemById } = require("../repositories/lobbyRepository");
const express = require("express");
const router = express.Router();
const { updateItem } = require("../repositories/lobbyRepository");
const { v4:  uuidv4 } = require("uuid");

function gameBackend()
{
    let globalChannel;
    let lobbies = {};

    const realtime = new Ably.Realtime({
        key: process.env.ABLY_API_KEY,
        echoMessages: false
    });

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
    });

    realtime.connection.once("connected", () => {
        console.log("Connected to Ably!");

        globalChannel = realtime.channels.get("globalChannel");
        globalChannel.presence.subscribe("enter", async(msg) => {
            const lobbyId = msg.data.lobbyId;
            const playerId = msg.clientId;

            let lobbyDB = await getItemById("lobby", { "lobbyId": lobbyId });
            lobbyDB = lobbyDB.Item;

            console.log(lobbyDB);

            if (lobbyDB.player2)
            {
                if (lobbyDB.player2.playerId !== playerId) return;

                const lobbyObj = lobbies[lobbyId];

                handlePlayerEnter(lobbyObj)
            }
            else
            {
                console.log("dsd")
                console.log(playerId);
                //if (lobbyDB.player1.playerId != playerId) return;

                console.log("lys")

                createLobby(lobbyDB, playerId);
                const lobbyObj = lobbies[lobbyId];
                handlePlayerEnter(lobbyObj)
            }
        });
    });

    const handlePlayerEnter = (lobbyObj, playerId) =>
    {
        console.log("Handle Player Enter");

        lobbyObj.createChannel = realtime.channels.get(`createChannel-${lobbyObj.lobbyId}`);
        lobbyObj.createChannel.attach();

        lobbyObj.winChannel = realtime.channels.get(`winChannel-${lobbyObj.lobbyId}`);
        lobbyObj.winChannel.attach();

        lobbyObj.playerChannels[playerId] = realtime.channels.get(`clientChannel-${playerId}`);
        lobbyObj.playerChannels[playerId].subscribe("gameReady", (msg) => {
            handleGameReady(msg);
        });
        lobbyObj.playerChannels[playerId].subscribe("shipPosition", (msg) => {
            handleShipPositionChange(msg);
        });
        lobbyObj.playerChannels[playerId].subscribe("shootCoordinates", (msg) => {
            handleShoot(msg);
        });
    };

    const handleGameReady = (msg) => 
    {
        console.log("Handle Game Ready");

        const lobbyId = msg.data.lobbyId;

        let lobbyDB = getItemById("lobby", { "lobbyId": lobbyId });
        lobbyDB.game.readyPlayers++

        updateItem("player", {"playerId": msg.clientId }, { "isReady": true });
        updateItem("lobby", {"lobbyId": msg.data.lobbyId }, { "game": lobbyDB.game });
    };

    const handleShipPositionChange = (msg) =>
    {
        console.log("Handle Ship Position Change");



        //updateItem("lobby", { "lobbyId": msg.data.lobbyId }, { "game":  })
    };

    const handleShoot = (msg) => 
    {
        console.log("Handle Shoot");
    };
    
    const createLobby = (lobbyDB, firstPlayerId) =>
    {
        console.log("Create Lobby");

        lobbies[lobbyDB.lobbyId] = {
            lobbyId: lobbyDB.lobbyId,
            players: [ firstPlayerId ],
            playerChannels: {}
        };

        const game = createGame(firstPlayerId);

        updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });
    };

    const createGame = (playerId) => {
        console.log("Create Game");

        let fields = generateFields(10);
        
        let ships = {};        
        generateShips(3, 2, ships);
        generateShips(3, 4, ships);
        generateShips(1, 6, ships);

        return {
            readyPlayers: 0,
            ships,
            fields,
            turn: playerId,
        };
    };
    
    const generateFields = (dimentionLength) => 
    {
        console.log("Generate Fields");
        let fields = [];

        for(let x = 0; x < dimentionLength; x++)
        {
            let row = [];
            for(let y = 0; y < dimentionLength; y++)
            {
                const fieldId = uuidv4();
    
                let field = {
                    fieldId: fieldId,
                    x,
                    y,
                    wasShoot: false,
                }
    
                row.push(field);
            }

            fields.push(row);
        }

        return fields;
    };
    
    const generateShips = (amount, shipLength, ships) => {
        console.log("Generate Ships");

        for(let i = 0; i < amount; i++)
        {
            const shipId = uuidv4();

            let ship = {
                shipId: shipId,
                fields: [],
                shipLength
            };

            ships[shipId] = ship;
        }
    };
}

module.exports = { 
    gameBackend,
    gameRouter: router
};
