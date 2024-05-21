const ShipUtil = require("./ShipUtil");
const { getItemById, updateItem } = require("../repositories/lobbyRepository");
const Ably = require("ably");
const Events = require("./Events");

class PlayerUtil{
    /**
     * @param {Ably.Realtime} realtime
     * @param {object} lobbyObj lobby object containing data about networking of lobby
     * @param {string} playerId 
     */
    static async handlePlayerEnter(realtime, lobbyObj, playerId)
    {
        console.log("Handle Player Enter");

        let lobbyDB = await getItemById("lobby", { "lobbyId": lobbyObj.lobbyId });
        lobbyDB = lobbyDB.Item;

        let game = lobbyDB.game;
        game.ships[playerId] = ShipUtil.generatePlayerShips();
        game.connectedPlayers++;
        game.shipsLeft[playerId] = 7;

        console.log(game.connectedPlayers);

        if (game.connectedPlayers === 1)
        {
            game.turn = playerId;
        }

        console.log(game.connectedPlayers);

        await updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });
        
        PlayerUtil.subscribeToPlayerEvents(realtime, lobbyObj, playerId, game);
    }

    /**
     * Subscribes to all necessery channels for player
     * @param {Ably.Realtime} realtime
     * @param {object} lobbyObj lobby object containing data about networking of lobby
     * @param {string} playerId 
     */
    static subscribeToPlayerEvents(realtime, lobbyObj, playerId, game)
    {
        lobbyObj.playerChannels[playerId] = realtime.channels.get(`clientChannel-${playerId}`);
        lobbyObj.playerChannels[playerId].subscribe("gameReady", (msg) => {
            Events.handleGameReady(msg, lobbyObj);
        });
        lobbyObj.playerChannels[playerId].subscribe("shipPosition", (msg) => {
            Events.handleShipPositionChange(msg);
        });
        lobbyObj.playerChannels[playerId].subscribe("shootField", (msg) => {
            Events.handleShootField(msg, lobbyObj);
        });
    }
}

module.exports = PlayerUtil;