const Stages = require("./Stages");
const { getItemById, updateItem } = require("../repositories/lobbyRepository");
const ShipUtil = require("./ShipUtil");

class Events{
    static async handleShipPositionChange(msg)
    {
        console.log("Handle Ship Position Change");

        let lobbyDB = await getItemById("lobby", { "lobbyId": msg.data.lobbyId });
        lobbyDB = lobbyDB.Item;
        let game = lobbyDB.game;

        if (!msg.data.fields) return;

        game.ships[msg.clientId][msg.data.shipId].fields = msg.data.fields;
        game.ships[msg.clientId][msg.data.shipId].lastValidPosition = msg.data.lastValidPosition;
        game.ships[msg.clientId][msg.data.shipId].displayWidth = msg.data.displayWidth;
        game.ships[msg.clientId][msg.data.shipId].displayHeight = msg.data.displayHeight;
        game.ships[msg.clientId][msg.data.shipId].angle = msg.data.angle;
        game.ships[msg.clientId][msg.data.shipId].textureKey = msg.data.textureKey;

        await updateItem("lobby", { "lobbyId": lobbyDB.lobbyId }, { "game": game });
    }

    static async handleGameReady(msg, lobbyObj) 
    {
        const lobbyId = msg.data.lobbyId;

        let lobbyDB = await getItemById("lobby", { "lobbyId": lobbyId });
        lobbyDB = lobbyDB.Item;

        if (lobbyDB.game.connectedPlayers < 2) return;

        console.log("Handle Game Ready");

        lobbyDB.game.readyPlayers++

        await updateItem("player", {"playerId": msg.clientId }, { "isReady": true });
        await updateItem("lobby", {"lobbyId": msg.data.lobbyId }, { "game": lobbyDB.game });
    }

    static async handleShootField(msg, lobbyObj) 
    {
        //get lobby
        const lobbyId = msg.data.lobbyId;
        let lobbyDB = await getItemById("lobby", { "lobbyId": lobbyId });
        lobbyDB = lobbyDB.Item;

        //check if its client turn
        let game = lobbyDB.game;
        if (game.turn !== msg.clientId) return;
        
        let enemyPlayerId = Events.#getNextTurnPlayerId(msg.clientId, lobbyDB);
        
        //check if field was already shoot
        const field = game.fields[enemyPlayerId][msg.data.x][msg.data.y];
        if (field.wasShoot) return;
        
        console.log("Handle Shoot");
        
        field.wasShoot = true;

        let hittedShip = false;

        //check wether any ship was shoot
        for(const shipId in game.ships[enemyPlayerId])
        {
            const ship = game.ships[enemyPlayerId][shipId];

            if (ShipUtil.isShipOnField(ship, field))
            {
                ship.fieldsLeft--;
                hittedShip = true;
            }
        }

        //update field and in all clients
        lobbyObj.lobbyChannel.publish("updateField", {
            fieldId: field.fieldId,
            hittedShip
        });

        // let playerDB = await getItemById("player", { "playerId": msg.clientId });
        // playerDB = playerDB.Item;

        //update turn in all clients
        lobbyObj.lobbyChannel.publish("updateTurn", {
            turnPlayerId: enemyPlayerId,
            //turnPlayerName: null
        });

        game.turn = enemyPlayerId;

        await updateItem("lobby", { "lobbyId": lobbyId }, { "game": game });
    }

    static #getNextTurnPlayerId(currentTurnPlayerId, lobbyDB)
    {
        let isFirstPlayer = currentTurnPlayerId === lobbyDB.player1;

        return isFirstPlayer === true? lobbyDB.player2 : lobbyDB.player1;
    }
}

module.exports = Events;