const ShipUtil = require("./ShipUtil");
const { getItemById, updateItem } = require("../repositories/lobbyRepository");
const Ably = require("ably");

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

        await updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });
        
        PlayerUtil.subscribeToPlayerEvents(realtime, lobbyObj, playerId);
    }

    /**
     * Subscribes to all necessery channels for player
     * @param {Ably.Realtime} realtime
     * @param {object} lobbyObj lobby object containing data about networking of lobby
     * @param {string} playerId 
     */
    static subscribeToPlayerEvents(realtime, lobbyObj, playerId)
    {
        lobbyObj.winChannel = realtime.channels.get(`winChannel-${lobbyObj.lobbyId}`);
        lobbyObj.winChannel.attach();

        lobbyObj.playerChannels[playerId] = realtime.channels.get(`clientChannel-${playerId}`);
        lobbyObj.playerChannels[playerId].subscribe("gameReady", (msg) => {
            handleGameReady(msg);
        });
        lobbyObj.playerChannels[playerId].subscribe("shipPosition", (msg) => {
            ShipUtil.handleShipPositionChange(msg);
        });
        lobbyObj.playerChannels[playerId].subscribe("shootCoordinates", (msg) => {
            handleShoot(msg);
        });
    }
}

module.exports = PlayerUtil;