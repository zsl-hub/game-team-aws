const { getItemById, updateItem } = require("../repositories/lobbyRepository");
const ShipUtil = require("./ShipUtil");
const Ably = require("ably");

class Stages{
    /**
     * @param {object} lobbyDB 
     * @param {void} callBack callback to execute when timer finishes ticking
     */
    static handleFirstStageStart(lobbyObj, lobbyDB, callBack)
    {
        console.log("First Stage Start");

        lobbyObj.lobbyChannel.publish("startFirstStage", {});

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

        const interval = setInterval(() => { 
            Stages.checkForTimerEnd(timeLeft, lobbyId, interval, callBack);
        }, 1000);
    }

    /**
     * @param {number} timeLeft 
     * @param {void} callBack callback to execute when timer finishes ticking
     */
    static async checkForTimerEnd(timeLeft, lobbyId, interval, callBack){
        let lobby = await getItemById("lobby", { "lobbyId": lobbyId});
        lobby = lobby.Item;

        let game = lobby.game;

        timeLeft *= 1000;

        let diff = new Date().getTime() - game.firstStageStart;

        console.log(diff);

        if (diff >= timeLeft)
        {
            clearInterval(interval);
            callBack();
        }
    }
    
    /**
     * @param {object} lobbyObj 
     */
    static handleSecondStageStart(lobbyObj){
        console.log("Second Stage Start");

        console.log("inside");
        console.log(lobbyObj);

        lobbyObj.lobbyChannel.publish("startSecondStage", {});
    }
}

module.exports = Stages;