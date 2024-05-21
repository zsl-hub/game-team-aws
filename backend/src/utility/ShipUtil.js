const { getItemById, updateItem } = require("../repositories/lobbyRepository");
const { v4:  uuidv4 } = require("uuid");

class ShipUtil{
    /**
     * Generates all required ship objects used of synchronization, required for a player
     * @returns {object[]} associative object (shipID => shipObject)
     */
    static generatePlayerShips()
    {
        let ships = {};
        
        ShipUtil.generateShips(3, 2, "shipx2", ships);
        ShipUtil.generateShips(3, 4, "shipx4", ships);
        ShipUtil.generateShips(1, 6, "shipx6", ships);

        return ships;
    }
    /**
     * Creates a certain amount of ship objects used for synchronization, and puts them to a specified associative object
     * (shipID => shipObject)
     * @param {number} amount 
     * @param {number} shipLength 
     * @param {string} shipSprite phaser client sprite name
     * @param {object[]} ships ref to object array which ships should bbe added
     */
    static generateShips(amount, shipLength, shipSprite, ships)
    {
        console.log(`Generate Ships: amount ${amount}, shipLength: ${shipLength}, shipSprite: ${shipSprite}`);

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
    }

    /**
     * Sends create message for every ship that player owns and sends a complete message at the end
     * @param {string} playerId 
     * @param {object} lobbyObj lobby object containing data about networking of lobby
     * @param {object} gameDB database object that represents game instance
     */
    static sendCreateMessages(playerId, lobbyObj, gameDB)
    {
        console.log(`Send Create Messages: playerId ${playerId}, lobbyObj ${lobbyObj}, gameDB ${gameDB}`);

        for(var key in gameDB.ships[playerId]){
            let ship = gameDB.ships[playerId][key];
            lobbyObj.playerChannels[playerId].publish("createShip", {
                shipId: ship.shipId,
                shipLength: ship.shipLength,
                shipSprite: ship.shipSprite
            });
        }

        lobbyObj.playerChannels[playerId].publish("createdAllShips", {});
    }

    static async handleShipPositionChange(msg)
    {
        console.log("Handle Ship Position Change");

        let lobbyDB = await getItemById("lobby", { "lobbyId": msg.data.lobbyId });
        lobbyDB = lobbyDB.Item;
        let game = lobbyDB.game;

        if (!msg.data.fields) return;

        game.ships[msg.clientId][msg.data.shipId].fields = msg.data.locations;

        await updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });
    }
}

module.exports = ShipUtil;