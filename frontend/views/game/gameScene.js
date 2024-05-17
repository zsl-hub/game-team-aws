export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    create() {
        const width = this.scale.width / 2;
        const height = this.scale.height;
        const cellSize = Math.min(width, height) / 15;

        const boardYOffset = -height * 0.05;
        // Board x and y
        const boardStartX = (width - cellSize * 10) / 2;
        const boardStartY = (height - cellSize * 10) / 2 + boardYOffset;

        const playerBackground = this.add.image(boardStartX + (cellSize * 10) / 2, boardStartY + (cellSize * 10) / 2, 'background');
        playerBackground.setDisplaySize(cellSize * 10, cellSize * 10);
        playerBackground.setOrigin(0.5);

        // Create boards 10x10
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const rect = this.add.rectangle(x * cellSize + boardStartX, y * cellSize + boardStartY, cellSize, cellSize);
                rect.setStrokeStyle(2, 0xffffff);
                rect.setOrigin(0);
            }
        }
        const enemyBoardOffsetX = width;

        const enemyBackground = this.add.image(enemyBoardOffsetX + boardStartX + (cellSize * 10) / 2, boardStartY + (cellSize * 10) / 2, 'background');
        enemyBackground.setDisplaySize(cellSize * 10, cellSize * 10);
        enemyBackground.setOrigin(0.5);

        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const rect = this.add.rectangle(enemyBoardOffsetX + x * cellSize + boardStartX, y * cellSize + boardStartY, cellSize, cellSize);
                rect.setStrokeStyle(2, 0xff0000);
                rect.setOrigin(0);
                rect.setInteractive();
                rect.setDepth(1);
                // Add pointerdown event to highlight the cell. Here you can add connection with database
                rect.on('pointerdown', () => {

                    rect.setFillStyle(0x00ff00, 1); // Green

                });
            }
        }
        const playerPosX = boardStartX + width * 0.5; // Need this to paste ships correct
        const enemyPosX = boardStartX + width * 0.5 - enemyBoardOffsetX;
        const ships = this.registry.get('ships'); // Can be changed to load data from database
        ships.forEach(shipData => {
            const ship = this.add.sprite(shipData.lastValidPosition.x - playerPosX, shipData.lastValidPosition.y, shipData.textureKey);
            ship.setDisplaySize(shipData.displayWidth, shipData.displayHeight);
            ship.setOrigin(0.5, 1);
            ship.angle = shipData.angle;
            ship.isPlaced = true;
            console.log(shipData.lastValidPosition);
        });
        // Text
        const yBoard = this.add.text(width * 0.5, height * 0.15 + boardYOffset, 'Your Board', { fontSize: width * 0.05, fill: '#fff' });
        yBoard.setOrigin(0.5);
        const eBoard = this.add.text(width * 1.5, height * 0.15 + boardYOffset, 'Enemy Board', { fontSize: width * 0.05, fill: '#fff' });
        eBoard.setOrigin(0.5);
    }
}

