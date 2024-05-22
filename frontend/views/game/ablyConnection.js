import Ably from "ably";
import config from '../../config/config.json';

function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

let params = parseURLParams(window.location.href);

export const playerId = params.playerId[0];
export const lobbyId = params.lobbyId[0];

/**@type {Ably.Realtime} */
const realtime = new Ably.Realtime({
    authUrl: config.host + config.endpoints.ablyAuth + `?playerId=${playerId}`,
    echoMessages: false
});

realtime.connection.once("connected", () => {
    console.log("Connected to ably!");
});

console.log(`clientChannel-${playerId}`);
export let myChannel = realtime.channels.get(`clientChannel-${playerId}`);

export let lobbyChannel = realtime.channels.get(`lobbyChannel-${lobbyId}`);

export let globalChannel = realtime.channels.get("globalChannel");
globalChannel.presence.enter({ lobbyId: lobbyId });