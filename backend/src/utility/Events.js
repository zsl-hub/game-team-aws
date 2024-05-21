const Stages = require("./Stages");
const { getItemById, updateItem } = require("../repositories/lobbyRepository");

class Events{
    static async handleShipPositionChange(msg)
    {
        console.log("Handle Ship Position Change");

        let lobbyDB = await getItemById("lobby", { "lobbyId": msg.data.lobbyId });
        lobbyDB = lobbyDB.Item;
        let game = lobbyDB.game;

        if (!msg.data.fields) return;

        game.ships[msg.clientId][msg.data.shipId].fields = msg.data.locations;
        game.ships[msg.clientId][msg.data.shipId].lastValidPosition = msg.data.lastValidPosition;
        game.ships[msg.clientId][msg.data.shipId].displayWidth = msg.data.displayWidth;
        game.ships[msg.clientId][msg.data.shipId].displayHeight = msg.data.displayHeight;
        game.ships[msg.clientId][msg.data.shipId].angle = msg.data.angle;

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

        if (lobbyDB.game.readyPlayers === 2)
        {
            Stages.handleSecondStageStart(lobbyObj);
        }
    }

    static handleShoot(msg) 
    {
        console.log("Handle Shoot");

        
    }
}

module.exports = Events;