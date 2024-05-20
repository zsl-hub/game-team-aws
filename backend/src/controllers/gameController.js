const Ably = require("ably");
const { getItemById, updateItem } = require("../repositories/lobbyRepository");
const express = require("express");
const router = express.Router();
const { v4:  uuidv4 } = require("uuid");

const PLAYERS_NEEDED_TO_START_GAME = 2;

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

    realtime.connection.once("connected", async () => {
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
                //if (lobbyDB.player2.playerId !== playerId) return;

                const lobbyObj = lobbies[lobbyId];

                await handlePlayerEnter(lobbyObj, playerId);
            }
            else
            {
                //if (lobbyDB.player1.playerId != playerId) return;

                await createLobby(lobbyDB, playerId);
                const lobbyObj = lobbies[lobbyId];

                await handlePlayerEnter(lobbyObj, playerId);
            }
        });
    });

    const createLobby = async (lobbyDB) =>
    {
        console.log("Create Lobby");

        lobbies[lobbyDB.lobbyId] = {
            lobbyId: lobbyDB.lobbyId,
            players: [],
            playerChannels: {}
        };

        const game = {
            readyPlayers: 0,
            ships: {},
        };

        await updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });
    };

    const handlePlayerEnter = async (lobbyObj, playerId) =>
    {
        console.log("Handle Player Enter");

        let lobbyDB = await getItemById("lobby", { "lobbyId": lobbyObj.lobbyId });
        lobbyDB = lobbyDB.Item;
        let game = lobbyDB.game;

        console.log(lobbyDB);

        game.ships[playerId] = generatePlayerShips();

        await updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });

        console.log(game.ships[playerId]);
       
        subscribeToPlayerEvents(lobbyObj, playerId);

        for(var key in game.ships[playerId]){
            let ship = game.ships[playerId][key];
            lobbyObj.playerChannels[playerId].publish("createShip", {
                shipId: ship.shipId,
                shipLength: ship.shipLength,
                shipSprite: ship.shipSprite
            });
        }

        lobbyObj.playerChannels[playerId].publish("createdAllShips", {});
    };

    const generatePlayerShips = () =>
    {
        ships = {};
        
        generateShips(3, 2, "shipx2", ships);
        generateShips(3, 4, "shipx4", ships);
        generateShips(1, 6, "shipx6", ships);

        return ships;
    };
    const generateShips = (amount, shipLength, shipSprite, ships) => {
        console.log("Generate Ships");

        for(let i = 0; i < amount; i++)
        {
            const shipId = uuidv4();

            let ship = {
                shipId: shipId,
                fields: [],
                shipLength,
                shipSprite
            };

            ships[shipId] = ship;
        }
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

    const subscribeToPlayerEvents = (lobbyObj, playerId) => {
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
    }

    const handleGameReady = (msg) => 
    {
        console.log("Handle Game Ready");

        const lobbyId = msg.data.lobbyId;

        let lobbyDB = getItemById("lobby", { "lobbyId": lobbyId });
        lobbyDB.game.readyPlayers++

        updateItem("player", {"playerId": msg.clientId }, { "isReady": true });
        updateItem("lobby", {"lobbyId": msg.data.lobbyId }, { "game": lobbyDB.game });

        if (lobbyDB.game.readyPlayers === PLAYERS_NEEDED_TO_START_GAME)
        {
            handleGameStart();
        }
    };

    const handleGameStart = () => {
        console.log("Game Start");
    };

    const handleShipPositionChange = async (msg) =>
    {
        console.log("Handle Ship Position Change");

        let lobbyDB = await getItemById("lobby", { "lobbyId": msg.data.lobbyId });
        lobbyDB = lobbyDB.Item;
        let game = lobbyDB.game;

        game.ships[msg.clientId][msg.data.shipId].fields = msg.data.locations;

        await updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });
    };

    const handleShoot = (msg) => 
    {
        console.log("Handle Shoot");
    };

}

module.exports = { 
    gameBackend,
    gameRouter: router
};
