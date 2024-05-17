import Phaser from 'phaser';
import BoardScene from './boardScene';
import GameScene from './gameScene';
import config from '../../config/config.json';
import Ably from "ably";

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

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

const playerId = params.playerId[0];
const lobbyId = params.lobbyId[0];

const realtime = new Ably.Realtime({
  authUrl: config.host + config.endpoints.ablyAuth + `?playerId=${playerId}`,
  echoMessages: false
});

let globalChannel;
let myChannel;

realtime.connection.once("connected", () => {
  console.log("Connected to ably!");

  globalChannel = realtime.channels.get("globalChannel");
  myChannel = realtime.channels.get(`clientChannel-${playerId}`);

  globalChannel.presence.enter({ lobbyId: lobbyId });
});

const sizes = {
  width: screenWidth * 0.8,
  height: screenHeight * 0.9
};

const gameConfig = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  scene: [BoardScene, GameScene],
};

const game = new Phaser.Game(gameConfig);

module.exports = {
  realtime,
  playerId,
  lobbyId,
  globalChannel,
  myChannel
};