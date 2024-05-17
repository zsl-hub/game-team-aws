const Ably = require("ably");
const { getLobby } = require("../repositories/gameRepository");
const express = require("express");
const router = express.Router();
const { updatePlayer } = require("../repositories/gameRepository");

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

            console.log(lobbyId + " " + playerId);

            let lobby = await getLobby(lobbyId);
            lobby = lobby.Item;

            console.log(lobby);

            if (lobby.player2)
            {
                if (lobby.player2.playerId !== playerId) return;

                const lobbyObj = lobbies[lobbyId];

                handlePlayerEnter(lobbyObj)
            }
            else
            {
                console.log(lobby.player1);
                if (lobby.player1.playerId !== playerId) return;

                createLobby(lobbyId, playerId);
                const lobbyObj = lobbies[lobbyId];
                handlePlayerEnter(lobbyObj)
            }
        });
    });

    const handlePlayerEnter = (lobbyObj, playerId) =>
    {
        console.log("Handle Player Enter");

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

        updatePlayer(msg.data.lobbyId, msg.clientId, { "isReady": true });
    };

    const handleShipPositionChange = (msg) =>
    {
        console.log("Handle Ship Position Change");
    };

    const handleShoot = (msg) => 
    {
        console.log("Handle Shoot");
    };
    
    const createLobby = (lobbyId, firstPlayerId) =>
    {
        console.log("Create Lobby");

        lobbies[lobbyId] = {
            lobbyId: lobbyId,
            players: [ firstPlayerId ],
            playerChannels: {}
        }
    };
    
}

module.exports = { 
    gameBackend,
    gameRouter: router
};
