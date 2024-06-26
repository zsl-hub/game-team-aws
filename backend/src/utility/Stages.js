const { getItemById, updateItem, deleteItemById } = require("../repositories/lobbyRepository");
const FieldUtil = require("./FieldUtil");
const ShipUtil = require("./ShipUtil");
const Ably = require("ably");
const Timers = require("./Timers");

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
      
        const timeLeft = 60;

        Stages.startFirstStageTimer(timeLeft, lobbyDB.lobbyId, callBack);

        lobbyObj.lobbyChannel.publish("firstStageStart", { timeLeft });
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

        if (diff >= timeLeft || game.readyPlayers === 2)
        {
            clearInterval(interval);
            callBack();
        }
    }
    
    /**
     * @param {object} lobbyObj 
     */
    static async handleSecondStageStart(lobbyObj){
        console.log("Second Stage Start");

        lobbyObj.lobbyChannel.publish("startSecondStage", {});

        await Stages.#createPlayerFields(lobbyObj);

        await Stages.#createPlayerShips(lobbyObj);

        Timers.startRoundTimer(60, lobbyObj.lobbyId, async() => {
            const lobbyId = lobbyObj.lobbyId;
            let lobbyDB = await getItemById("lobby", { "lobbyId": lobbyId });
            lobbyDB = lobbyDB.Item;

            let game = lobbyDB.game
            let enemyId = game.turn === game.player1? lobbyDB.player2 : lobbyDB.player1;

            Stages.endGame(lobbyId, enemyId, game.turn, lobbyObj);
        });
    }

    static async #createPlayerFields(lobbyObj){
        let lobby = await getItemById("lobby", { "lobbyId": lobbyObj.lobbyId});
        lobby = lobby.Item;
        
        let game = lobby.game;
        game.fields[lobby.player1] = FieldUtil.generateFields(10);
        game.fields[lobby.player2] = FieldUtil.generateFields(10);
        
        const player1Channel = lobbyObj.playerChannels[lobby.player1];
        player1Channel.publish("createMyBoard", {
            fields: game.fields[lobby.player1]
        });
        player1Channel.publish("createEnemyBoard", {
            fields: game.fields[lobby.player2]
        });

        const player2Channel = lobbyObj.playerChannels[lobby.player2];
        player2Channel.publish("createMyBoard", {
            fields: game.fields[lobby.player2]
        });
        player2Channel.publish("createEnemyBoard", {
            fields: game.fields[lobby.player1]
        });

        await updateItem("lobby", { "lobbyId": lobbyObj.lobbyId }, { "game": game });
    }

    static async #createPlayerShips(lobbyObj){
        let lobby = await getItemById("lobby", { "lobbyId": lobbyObj.lobbyId });
        lobby = lobby.Item;

        let game = lobby.game;

        for(const playerId in lobbyObj.playerChannels){
            const playerChannel = lobbyObj.playerChannels[playerId];

            console.log("ship");

            playerChannel.publish("createShips", {
                ships: game.ships[playerId]
            });
        }

        lobbyObj.lobbyChannel.publish("updateTurn", {
            turnPlayerId: game.turn,
            //turnPlayerName: null
        });
    }

    static async endGame(lobbyId, winnerId, looserId, lobbyObj)
    {
        console.log(lobbyId);
        console.log(winnerId);
        console.log(looserId);

        let playerDB = await getItemById("player", { "playerId": winnerId });
        playerDB = playerDB.Item;

        lobbyObj.lobbyChannel.publish("winner", {
            playerId: winnerId,
            playerName: playerDB.playerName
        });
        
        await deleteItemById("lobby", { "lobbyId": lobbyId });
        await deleteItemById("player", { "playerId": winnerId });
        await deleteItemById("player", { "playerId": looserId });
    }
}

module.exports = Stages;