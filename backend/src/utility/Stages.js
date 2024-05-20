const { getItemById } = require("../repositories/lobbyRepository");
const ShipUtil = require("./ShipUtil");
const Ably = require("ably");

class Stages{
    /**
     * @param {object} lobbyDB 
     * @param {void} callBack callback to execute when timer finishes ticking
     */
    static handleFirstStageStart(lobbyDB, callBack)
    {
        console.log("First Stage Start");

        lobbyObj.lobbyChannel.publish("startFirstStage", {});

        let lobbyObj = lobbies[lobbyId];

        for(const playerId in lobbyObj.playerChannels)
        {
            ShipUtil.sendCreateMessages(playerId, lobbyObj, lobbyDB.game);
        }

        Stages.startFirstStageTimer(60, lobbyDB.lobbyId, callBack);
    }

    /**
     * @param {number} timeLeft 
     * @param {string} lobbyId 
     * @param {void} callBack callback to execute when timer finishes ticking
     */
    static async startFirstStageTimer(timeLeft, lobbyId, callBack){
        let lobby = await getItemById("lobby", { "lobbyId": lobbyId});
        lobby = lobby.Item;

        let game = lobby.game;
        game.firstStageStart = new Date().getTime();

        await updateItem("lobby", { "lobbyId": lobbyId }, { "game": game });

        setInterval(() => { 
            Stages.checkForTimerEnd(timeLeft, callBack);
        }, 1000);
    }

    /**
     * @param {number} timeLeft 
     * @param {void} callBack callback to execute when timer finishes ticking
     */
    static async checkForTimerEnd(timeLeft, callBack){
        let lobby = await getItemById("lobby", { "lobbyId": lobbyId});
        lobby = lobby.Item;

        let game = lobby.game;

        let diff = new Date().getTime() - game.firstStageStart;

        if (diff >= timeLeft)
        {
            callBack();
        }
    }
    
    /**
     * @param {object} lobbyObj 
     */
    static handleSecondStageStart(lobbyObj){
        console.log("Second Stage Start");

        lobbyObj.lobbyChannel.publish("startSecondStage", {});
    }
}

module.exports = Stages;