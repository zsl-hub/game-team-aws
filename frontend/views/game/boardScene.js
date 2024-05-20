import Phaser from 'phaser';
import config from "../../config/config.json"
import { myChannel, globalChannel, lobbyId} from "./ablyConnection.js";

export default class BoardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BoardScene' });

        this.firstTime = false;
    }

    preload() {
        this.load.image('shipx2', 'assets/shipX2.png');
        this.load.image('shipx4', 'assets/shipX4.png');
        this.load.image('shipx6', 'assets/shipX6.png');
        this.load.image('background', 'assets/background.png')
    }

    create() {
        const width = this.scale.width / 2;
        const height = this.scale.height;
        const cellSize = Math.min(width, height) / 15;

        const boardYOffset = -height * 0.05;
        // Board x and y
        const boardStartX = (width - cellSize * 10) + width * 0.5;
        const boardStartY = (height - cellSize * 10) / 2 + boardYOffset;
        const background = this.add.image(boardStartX + (cellSize * 10) / 2, boardStartY + (cellSize * 10) / 2, 'background');
        background.setDisplaySize(cellSize * 10, cellSize * 10); // Dopasowanie rozmiaru tła do planszy
        background.setOrigin(0.5);
        let allShipsPlaced = false;
        // Create board 10x10
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const rect = this.add.rectangle(x * cellSize + boardStartX, y * cellSize + boardStartY, cellSize, cellSize);
                rect.setStrokeStyle(2, 0xffffff);
                rect.setOrigin(0);
            }
        }
        // Button "Ready"
        const readyButton = this.add.text(width * 0.5, height * 0.95, 'Ready', { fontSize: width * 0.06, fill: '#fff', backgroundColor: '#00ff00', padding: { x: width * 0.030, y: height * 0.015 }, fixedWidth: width * 0.24, fixedHeight: height * 0.08 });
        readyButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => readyButton.setBackgroundColor('#33ff33')) // Hover background
            .on('pointerout', () => readyButton.setBackgroundColor('#00ff00')); // None hover

        readyButton.setOrigin(0.5);
        readyButton.setPosition(width * 0.2, height * 0.8)
        readyButton.setInteractive();
        readyButton.on('pointerdown', () => {
            allShipsPlaced = true;
            ships.forEach(ship => {
                if (ship.isPlaced === false) {
                    allShipsPlaced = false;
                    return;
                }
            });
            if (allShipsPlaced) {
                shipHold.destroy(); // Drop shipHold
                readyButton.destroy(); // Drop readyButton
                const shipsData = ships.map(ship => ({
                    x: ship.x,
                    y: ship.y,
                    angle: ship.angle,
                    textureKey: ship.texture.key,
                    displayWidth: ship.displayWidth,
                    displayHeight: ship.displayHeight,
                    lastValidPosition: ship.lastValidPosition
                }));
                ships.forEach(ship => {
                    ship.disableInteractive();
                });
                this.registry.set('ships', shipsData);

                myChannel.publish("gameReady", {
                    lobbyId: lobbyId,
                })

                this.scene.start('GameScene'); // start GameScene
                // Deactivate ships

            }
        });
        // Create board for ships
        const shipHoldWidth = width * 0.45;
        const shipHoldHeight = height * 0.65;
        const shipHold = this.add.rectangle(width * 0.225, height * 0.325, shipHoldWidth, shipHoldHeight);
        shipHold.setStrokeStyle(2, 0x00ff00);
        shipHold.setOrigin(0.5);
        const menu = this.add.rectangle
        // Text
        const yBoard = this.add.text(width * 1.17, height * 0.15 + boardYOffset, 'Your Board', { fontSize: width * 0.08, fill: '#fff' });
        yBoard.setOrigin(0.5);
        // Battleships
        const ships = [];
        let shipY = width * 0.10;

        myChannel.subscribe("createShip", (msg) => {
            let ship = this.add.sprite(height * 0.10, shipY, msg.data.shipSprite).setDisplaySize(cellSize * msg.data.shipLength, cellSize).setOrigin(0.5, 1);
            ship.id = msg.data.shipId;

            shipY += width * 0.2;

            ships.push(ship);
        });

        myChannel.subscribe("createdAllShips", (msg) => {
            // Ships settings
            ships.forEach(ship => {
                ship.rotatedWidth = ship.displayWidth;
                ship.rotatedHeight = ship.displayHeight;
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
                bounds.y >= boardStartY && bounds.y + bounds.height <= boardStartY + cellSize * 10);
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

            myChannel.publish("shipPosition", {
                lobbyId: lobbyId,
                x: gameObject.lastValidPosition.x,
                y: gameObject.lastValidPosition.y
            });

            let shipSizeX = gameObject.rotatedWidth / cellSize;
            let shipSizeY = gameObject.rotatedHeight / cellSize;
 
            let offsetPosModifierX = shipSizeX === 1? 1 : 2;
            let offsetPosModifierY = shipSizeY === 1? 1 : 2;

            let realPosX =  Math.round(Math.round(gameObject.lastValidPosition.x - cellSize * shipSizeX / offsetPosModifierX));
            let realPosY =  Math.round(Math.round(gameObject.lastValidPosition.y - cellSize * shipSizeY / offsetPosModifierY));
            realPosX -= Math.round(boardStartX);
            realPosY -= Math.round(boardStartY);
            
            
            let positionX = Math.round(realPosX / cellSize);
            let positionY = Math.round(realPosY / cellSize);
            
            console.log(realPosX, realPosY);
            console.log(positionX, positionY);
            console.log(shipSizeX, shipSizeY);

            let locations = [];

            for(let x = positionX; x < positionX + shipSizeX; x++)
            {
                for(let y = positionY; y < positionY + shipSizeY; y++)
                {
                    locations.push({
                        x,
                        y
                    });
                }
            }

            console.log(locations);
            
            myChannel.publish("shipPosition", {
                lobbyId,
                shipId: gameObject.id,
                fields: locations
            });
        });

        this.input.keyboard.on('keydown-R', () => {
            if (this.selectedShip) {
                // Check if the selected ship is within the board after rotation
                let isVertical = this.selectedShip.angle % 180 === 0;
                console.log(isVertical);
                const newAngle = isVertical? this.selectedShip.angle - 90 : this.selectedShip.angle + 90;
                isVertical = this.selectedShip.angle % 180 === 0;
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
                    this.selectedShip.rotatedWidth = newWidth;
                    this.selectedShip.rotatedHeight = newHeight;
                } else if (isCompletelyOutsideBoard) {
                    this.selectedShip.angle = newAngle;
                    this.selectedShip.isRotated = !this.selectedShip.isRotated;
                    this.selectedShip.isPlaced = false;
                    this.selectedShip.rotatedWidth = newWidth;
                    this.selectedShip.rotatedHeight = newHeight;
                }
            }
        });
    }

    update() {
    }   
}
