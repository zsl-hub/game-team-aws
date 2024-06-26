const Stages = require("./Stages");
const { getItemById, updateItem, deleteItemById } = require("../repositories/lobbyRepository");
const ShipUtil = require("./ShipUtil");
const Timers = require("./Timers");

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
    static #changesUpdated = true;
    static async handleShootField(msg, lobbyObj)
    {
        console.log("first");

        if (Events.#changesUpdated === false) {
            setTimeout(() => {
                Events.#changesUpdated = true;
            }, 2500);

            return;
        }
        Events.#changesUpdated = false;

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
        clearInterval(Timers.latestTimerInterval);
        
        field.wasShoot = true;
        let endGame = false;

        let hitdata = await Events.#wereShipsShoot(game, enemyPlayerId, field,
            async (ship) => {
                lobbyObj.playerChannels[msg.clientId].publish("destoyedShip", {
                    shipId: ship.shipId,
                    lastValidPosition: ship.lastValidPosition,
                    displayWidth: ship.displayWidth,
                    displayHeight: ship.displayHeight,
                    angle: ship.angle,
                    textureKey: ship.textureKey
                });
                
                game.shipsLeft[enemyPlayerId]--;

                if (game.shipsLeft[enemyPlayerId] <= 0)
                {
                    clearInterval(Timers.latestTimerInterval);
                    endGame = true;
                    await Stages.endGame(lobbyId, msg.clientId, enemyPlayerId, lobbyObj);
                    
                    return;
                }
            }
        );

        game.turn = hitdata.hittedShip? msg.clientId : enemyPlayerId;
        
        await updateItem("lobby", { "lobbyId": lobbyId }, { "game": game });
        

        Events.#updateClients(lobbyObj, hitdata.hittedShip, field, game.turn);
        
        console.log(hitdata.endGame);

        if(hitdata.endGame === false){
            Timers.startRoundTimer(60, lobbyId, async() => {
                await Stages.endGame(lobbyId, enemyPlayerId, msg.clientId, lobbyObj);
            });
        }

        Events.#changesUpdated = true;
    }

    static #getNextTurnPlayerId(currentTurnPlayerId, lobbyDB)
    {
        let isFirstPlayer = currentTurnPlayerId === lobbyDB.player1;

        return isFirstPlayer === true? lobbyDB.player2 : lobbyDB.player1;
    }

    static async #wereShipsShoot(game, enemyPlayerId, field, destroyShipCallBack){
        let hittedShip = false;
        let endGame = false;

        for(const shipId in game.ships[enemyPlayerId])
        {
            const ship = game.ships[enemyPlayerId][shipId];

            if (ShipUtil.isShipOnField(ship, field))
            {
                ship.fieldsLeft--;
                hittedShip = true;

                if (ship.fieldsLeft <= 0)
                {
                    endGame = true;
                    await destroyShipCallBack(ship);
                }
            }
        }

        return { hittedShip, endGame };
    }

    static #updateClients(lobbyObj, hittedShip, field, nextTurnPlayerID){
        lobbyObj.lobbyChannel.publish("updateField", {
            fieldId: field.fieldId,
            hittedShip
        });

        // let playerDB = await getItemById("player", { "playerId": msg.clientId });
        // playerDB = playerDB.Item;

        lobbyObj.lobbyChannel.publish("updateTurn", {
            turnPlayerId: nextTurnPlayerID,
            //turnPlayerName: null
        });
    }
}

module.exports = Events;