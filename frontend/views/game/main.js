import './style.css';
import Phaser from 'phaser';
import Ably from "ably";
import config from "../../config/config.json";

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const sizes = {
    width: screenWidth * 0.8,
    height: screenHeight * 0.9
}

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
})

class BoardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BoardScene' });
    }
    
    preload() {
        this.load.image('logo2', 'assets/logo.png');
        this.load.image('logo4', 'assets/logo.png');
        this.load.image('logo6', 'assets/logo.png');
    }

    create() {
        const width = this.scale.width / 2;
        const height = this.scale.height;
        const cellSize = Math.min(width, height) / 15;

        const boardYOffset = -height * 0.05;
        // Board x and y
        const boardStartX = (width - cellSize * 10) / 2;
        const boardStartY = (height - cellSize * 10) / 2 + boardYOffset;

        let allShipsPlaced = false;
        const readyButton = this.add.text(width * 0.5, height * 0.95, 'Ready', { fontSize: width * 0.03, fill: '#fff', backgroundColor: '#00ff00', padding: {x: width * 0.030, y: height * 0.015 }, fixedWidth: width * 0.15, fixedHeight: height * 0.05});
        // Create boards 10x10
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const rect = this.add.rectangle(x * cellSize + boardStartX, y * cellSize + boardStartY, cellSize, cellSize);
                rect.setStrokeStyle(2, 0xffffff);
                rect.setOrigin(0);
            }
        }
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const rect = this.add.rectangle(width + x * cellSize + boardStartX, y * cellSize + boardStartY, cellSize, cellSize);
                rect.setStrokeStyle(2, 0xff0000);
                rect.setOrigin(0);
            }
        }
        // Button "Ready"
        readyButton.setInteractive({ useHandCursor: true })
        .on('pointerover', () => readyButton.setBackgroundColor('#33ff33')) // Hover background
        .on('pointerout', () => readyButton.setBackgroundColor('#00ff00')); // None hover

        readyButton.setOrigin(0.5);
        readyButton.setPosition(width,height/2)
        readyButton.setInteractive();
        readyButton.on('pointerdown', () => {
            allShipsPlaced = true;
            ships.forEach(ship => {
                if (ship.isPlaced === false) {
                    allShipsPlaced = false;
                    return;
                    
                } 
            });
            if(allShipsPlaced) {
                shipHold.destroy(); // Drop shipHold
                readyButton.destroy(); // Drop readyButton
                // Deactivate ships
                ships.forEach(ship => {
                    ship.disableInteractive();
                    ship.off('pointerdown');
                });
            }
        });
        // Create board for ships
        const shipHoldWidth = width * 1.4;
        const shipHoldHeight = height * 0.2;
        const shipHold = this.add.rectangle(width, height * 0.9, shipHoldWidth, shipHoldHeight);
        shipHold.setStrokeStyle(2, 0x00ff00);
        shipHold.setOrigin(0.5);
        // Text
        const yBoard = this.add.text(width * 0.5, height * 0.15 + boardYOffset, 'Your Board', { fontSize: width * 0.05, fill: '#fff' });
        yBoard.setOrigin(0.5);
        const eBoard = this.add.text(width * 1.5, height * 0.15 + boardYOffset, 'Enemy Board', { fontSize: width * 0.05, fill: '#fff' });
        eBoard.setOrigin(0.5);
        // Battleships
        const ships = [];
        // 2
        ships.push(this.add.sprite(width * 0.43, height * 0.88, 'logo2').setDisplaySize(cellSize * 2, cellSize).setOrigin(0.5,1));
        ships.push(this.add.sprite(width * 0.43, height * 0.98, 'logo2').setDisplaySize(cellSize * 2, cellSize).setOrigin(0.5,1));
        ships.push(this.add.sprite(width * 0.67, height * 0.88, 'logo2').setDisplaySize(cellSize * 2, cellSize).setOrigin(0.5,1));
        // 4
        ships.push(this.add.sprite(width * 0.97, height * 0.88, 'logo4').setDisplaySize(cellSize * 4, cellSize).setOrigin(0.5,1));
        ships.push(this.add.sprite(width * 0.97, height * 0.98, 'logo4').setDisplaySize(cellSize * 4, cellSize).setOrigin(0.5,1));
        ships.push(this.add.sprite(width * 0.67, height * 0.98, 'logo4').setDisplaySize(cellSize * 4, cellSize).setOrigin(0.5,1));
        // 6
        ships.push(this.add.sprite(width * 1.40, height * 0.93, 'logo6').setDisplaySize(cellSize * 6, cellSize).setOrigin(0.5,1));
        // Ships settings
        ships.forEach(ship => {
            ship.setInteractive();
            this.input.setDraggable(ship);
            ship.isRotated = false;
            ship.isPlaced = false;
            // Initialize lastValidPosition
            ship.lastValidPosition = { x: ship.x, y: ship.y };
            
            ship.on('pointerdown', () => {
                this.selectedShip = ship; // Track the selected ship 
            });
        });

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setTint(0xff0000);
          
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        
            const gridX = Math.round((gameObject.x - boardStartX) / cellSize) * cellSize + boardStartX;
            const gridY = Math.round((gameObject.y - boardStartY) / cellSize) * cellSize + boardStartY;
            
            const bounds = gameObject.getBounds();
            // Check if the ship is within the board boundaries
            const isWithinBoard = (bounds.x >= boardStartX && bounds.x + bounds.width <= boardStartX + cellSize * 10 &&
                                   bounds.y >= boardStartY && bounds.y + bounds.height <= boardStartY + cellSize * 10 );
            // Check if the ship is within the board boundaries
            if (isWithinBoard) {
                    gameObject.setPosition(gridX, gridY);
                    gameObject.lastValidPosition = { x: gameObject.x, y: gameObject.y }; // Update last valid position
                    this.selectedShip.isPlaced = true;
            }
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setPosition(gameObject.lastValidPosition.x, gameObject.lastValidPosition.y);
            gameObject.clearTint();
        });
        this.input.keyboard.on('keydown-R', () => {
            if (this.selectedShip) {
                // Check if the selected ship is within the board after rotation
                const newAngle = this.selectedShip.angle + 90;
                const isVertical = newAngle % 180 === 90;
                const newWidth = isVertical ? this.selectedShip.displayHeight : this.selectedShip.displayWidth;
                const newHeight = isVertical ? this.selectedShip.displayWidth : this.selectedShip.displayHeight;

                const newBounds = {
                    x: this.selectedShip.x - newWidth / 2,
                    y: this.selectedShip.y - newHeight / 2,
                    width: newWidth,
                    height: newHeight
                }
                const newIsWithinBoard = (newBounds.x >= boardStartX && newBounds.x + newBounds.width <= boardStartX + cellSize * 10 &&
                                          newBounds.y >= boardStartY && newBounds.y + newBounds.height <= boardStartY + cellSize * 10);
                // Check if the selected ship is completely outside board
                const isCompletelyOutsideBoard = (newBounds.x + newBounds.width < boardStartX || newBounds.x > boardStartX + cellSize * 10 ||
                                                  newBounds.y + newBounds.height < boardStartY || newBounds.y > boardStartY + cellSize * 10);
                // Check ship is inside or outside
                if (newIsWithinBoard) {
                    this.selectedShip.angle = newAngle;
                    this.selectedShip.isRotated = !this.selectedShip.isRotated;
                    this.selectedShip.isPlaced = true;
                } else if (isCompletelyOutsideBoard) {
                    this.selectedShip.angle = newAngle;
                    this.selectedShip.isRotated = !this.selectedShip.isRotated;
                    this.selectedShip.isPlaced = false;
                }
            }
        });
    }

    update() {
    }
}

const gameConfig = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    canvas: gameCanvas,
    scene: [BoardScene],
}

const game = new Phaser.Game(gameConfig);