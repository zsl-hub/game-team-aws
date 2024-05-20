const Stages = require("./Stages");

class Events{
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

    static handleGameReady(msg) 
    {
        console.log("Handle Game Ready");

        const lobbyId = msg.data.lobbyId;

        let lobbyDB = getItemById("lobby", { "lobbyId": lobbyId });
        lobbyDB.game.readyPlayers++

        updateItem("player", {"playerId": msg.clientId }, { "isReady": true });
        updateItem("lobby", {"lobbyId": msg.data.lobbyId }, { "game": lobbyDB.game });

        if (lobbyDB.game.readyPlayers === 2)
        {
            Stages.handleSecondStageStart();
        }
    }

    static handleShoot(msg) 
    {
        console.log("Handle Shoot");
    }
}

module.exports = Events;