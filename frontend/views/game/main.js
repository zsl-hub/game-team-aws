import './style.css';
import Phaser from 'phaser';

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const sizes = {
    width: screenWidth *0.8,
    height: screenHeight *0.9
}

class BoardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BoardScene' });
    }

    preload() {
        this.load.image('logo','assets/logo.png');  
    }

    create() {
        const width = this.scale.width/2;
        const height = this.scale.height;
        const cellSize = Math.min(width, height) / 15;
       
        const boardYOffset = -height * 0.1;

        const boardStartX = (width - cellSize * 10) / 2;
        const boardStartY = (height - cellSize * 10) / 2 + boardYOffset;
        //create boards 10x10
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
        // create board for ships
        const shipHoldWidth = width * 1.4;
        const shipHoldHeight = height * 0.25;
        const shipHold = this.add.rectangle(width, height * 0.9,shipHoldWidth, shipHoldHeight);
        shipHold.setStrokeStyle(2, 0x00ff00);
        shipHold.setOrigin(0.5);
        //text
        const yBoard = this.add.text(width * 0.5, height * 0.15 + boardYOffset, 'Your Board', { fontSize: height * 0.05, fill: '#fff' });
        yBoard.setOrigin(0.5);
        const eBoard = this.add.text(width * 1.5, height * 0.15 + boardYOffset, 'Enemy Board', { fontSize: height * 0.05, fill: '#fff' });
        eBoard.setOrigin(0.5);
        // battleships
        const ships = [];
        //2
        ships.push(this.add.sprite(width * 0.40, height * 0.85, 'logo' ).setDisplaySize(cellSize* 2, cellSize));
        ships.push(this.add.sprite(width * 0.40, height * 0.95, 'logo' ).setDisplaySize(cellSize* 2, cellSize));
        //3
        ships.push(this.add.sprite(width * 0.64, height * 0.85, 'logo' ).setDisplaySize(cellSize* 3, cellSize));
        ships.push(this.add.sprite(width * 0.64, height * 0.95, 'logo' ).setDisplaySize(cellSize* 3, cellSize));
        //4
        ships.push(this.add.sprite(width * 0.94, height * 0.85, 'logo' ).setDisplaySize(cellSize* 4, cellSize));
        ships.push(this.add.sprite(width * 0.94, height * 0.95, 'logo' ).setDisplaySize(cellSize* 4, cellSize));
        //6
        ships.push(this.add.sprite(width * 1.40, height * 0.89, 'logo' ).setDisplaySize(cellSize* 5, cellSize));
    }

    update() {
    }
}

const config = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    canvas: gameCanvas,
    scene: [BoardScene],
}

const game = new Phaser.Game(config);