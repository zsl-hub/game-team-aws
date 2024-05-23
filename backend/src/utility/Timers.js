const { getItemById, updateItem } = require("../repositories/lobbyRepository");

class Timers{
    static latestTimerInterval;

    static async startRoundTimer(timeLeft, lobbyId, callBack)
    {
        let lobby = await getItemById("lobby", { "lobbyId": lobbyId});
        lobby = lobby.Item;

        let game = lobby.game;
        game.roundStart = new Date().getTime();

        await updateItem("lobby", { "lobbyId": lobbyId }, { "game": game });

        timeLeft *= 1000;
        
        Timers.latestTimerInterval = setInterval(async() => {
            let lobby = await getItemById("lobby", { "lobbyId": lobbyId});
            lobby = lobby.Item;

            let game = lobby.game;
            let diff = new Date().getTime() - game.roundStart;

            console.log(diff);

            if (diff >= timeLeft)
            {
                clearInterval(Timers.latestTimerInterval);
                callBack();
            }
        }, 1000);
    }
}

module.exports = Timers;