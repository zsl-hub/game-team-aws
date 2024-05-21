import { myChannel, globalChannel, lobbyChannel, lobbyId } from "./ablyConnection";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.players = [
            { name: 'Player 1', isInGame: true },
            { name: 'Player 2', isInGame: true }
        ];
        this.winnerText = null;
        this.modal = null;
        this.confirmText = null;
        this.continueButton = null;
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

        let myBoard = [];

        myChannel.subscribe("createMyBoard", (msg) => {
            const data = msg.data;

            // Create boards 10x10
            for (let x = 0; x < 10; x++) {
                let row = [];
                for (let y = 0; y < 10; y++) {
                    const rect = this.add.rectangle(x * cellSize + boardStartX, y * cellSize + boardStartY, cellSize, cellSize);
                    rect.setStrokeStyle(2, 0xffffff);
                    rect.setOrigin(0);
                    rect.id = data.fields[x, y].fieldId;

                    row.push(rect);
                }
                myBoard.push(row);
            }
        });

        const enemyBoardOffsetX = width;

        const enemyBackground = this.add.image(enemyBoardOffsetX + boardStartX + (cellSize * 10) / 2, boardStartY + (cellSize * 10) / 2, 'background');
        enemyBackground.setDisplaySize(cellSize * 10, cellSize * 10);
        enemyBackground.setOrigin(0.5);

        let enemyRectangles = [];

        myChannel.subscribe("createEnemyBoard", (msg) => {
            let data = msg.data;

            for (let x = 0; x < 10; x++) {
                let row = [];
                for (let y = 0; y < 10; y++) {
                    const rect = this.add.rectangle(enemyBoardOffsetX + x * cellSize + boardStartX, y * cellSize + boardStartY, cellSize, cellSize);
                    rect.setStrokeStyle(2, 0xff0000);
                    rect.setOrigin(0);
                    rect.setInteractive();
                    rect.setDepth(1);
                    rect.id = data.fields[x, y].fieldId;
                    // Add pointerdown event to highlight the cell. Here you can add connection with database
                    rect.on('pointerdown', () => {
    
                        rect.setFillStyle(0x00ff00, 1); // Green
                        
                        myChannel.publish("shootShip", {
                            lobbyId: lobbyId,
                            x,
                            y
                        });
                    });

                    row.push(rect);
                }
                enemyRectangles.push(row);
            }
        });

        const playerPosX = boardStartX + width * 0.5; // Need this to paste ships correct
        const enemyPosX = boardStartX + width * 0.5 - enemyBoardOffsetX;

        let ships = {};

        myChannel.subscribe("createShips", (msg) => {
            let data = msg.data;

            console.log("createShips");

            for(const shipId in data.ships){
                const shipData = data.ships[shipId];
            
                console.log(shipData);

                const ship = this.add.sprite(shipData.lastValidPosition.x - playerPosX, shipData.lastValidPosition.y, shipData.textureKey);
                ship.setDisplaySize(shipData.displayWidth, shipData.displayHeight);
                ship.setOrigin(0.5, 1);
                ship.angle = shipData.angle;
                ship.isPlaced = true;
                ship.id = shipId;

                ships[shipId] = ship;

                console.log(shipData.lastValidPosition, shipData.displayHeight, shipData.displayWidth);
            }
        });

        myChannel.subscribe("updateShip", (msg) => {
            let data = msg.data;

            let shipData = ships[data.shipId];
            let ship = ships[shipData.shipId];
        });
            
        // Text
        const yBoard = this.add.text(width * 0.5, height * 0.15 + boardYOffset, 'Your Board', { fontSize: width * 0.05, fill: '#fff' });
        yBoard.setOrigin(0.5);
        const eBoard = this.add.text(width * 1.5, height * 0.15 + boardYOffset, 'Enemy Board', { fontSize: width * 0.05, fill: '#fff' });
        eBoard.setOrigin(0.5);

        // Create winner text but keep it invisible until a player wins
        this.winnerText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '', { fontSize: width * 0.05, fill: '#ffffff' });
        this.winnerText.setOrigin(0.5);
        this.winnerText.setVisible(false);

        // Create modal but keep it invisible until "Quit" is clicked
        this.modal = this.add.graphics();
        this.modal.fillStyle(0x0000ff, 0.5); // Semi-transparent blue
        this.modal.fillRect(0, 0, this.scale.width, this.scale.height);
        this.modal.setVisible(false);

        this.confirmText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Are you sure you want to quit? You will lose the game.', { fontSize: width * 0.05, fill: '#ffffff' }); // White text
        this.confirmText.setOrigin(0.5);
        this.confirmText.setVisible(false);

        this.continueButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Continue', { fontSize: width * 0.05, fill: '#ffffff' }); // White text
        this.continueButton.setOrigin(0.5);
        this.continueButton.setInteractive();
        this.continueButton.setVisible(false);

        // Add pointerover event for hover effect
        // Add pointerover event for hover effect
        this.continueButton.on('pointerover', () => {
            this.continueButton.setFill('#ff0000'); // Red
            this.game.canvas.style.cursor = 'pointer'; // Change cursor to pointer
        });

        // Add pointerout event to remove hover effect
        this.continueButton.on('pointerout', () => {
            this.continueButton.setFill('#ffffff'); // White
            this.game.canvas.style.cursor = 'default'; // Change cursor back to default
        });

        this.continueButton.on('pointerdown', () => {
            // Player confirmed they want to quit
            this.players[0].isInGame = false;

            // Show winner text for Player 2
            this.winnerText.setText(`${this.players[1].name} wins!`);
            this.winnerText.setVisible(true);

            // Hide modal
            this.modal.setVisible(false);
            this.confirmText.setVisible(false);
            this.continueButton.setVisible(false);

            // Redirect to another page after 3 seconds
            setTimeout(() => {
                window.location.href = '../lobby/lobby.html';
            }, 3000);
        });

        const quitButtonBackground = this.add.rectangle(width * 0.5, height * 0.9, width * 0.24, height * 0.08, 0xff0000); // Red rectangle
        quitButtonBackground.setOrigin(0.5);
        quitButtonBackground.setInteractive();
        
        const quitButton = this.add.text(width * 0.5, height * 0.9, 'QUIT', { fontSize: width * 0.05, fill: '#ffffff' }); // White text
        quitButton.setOrigin(0.5);
        quitButton.setInteractive();

        // Add pointerover event for hover effect
        quitButtonBackground
        quitButton.on('pointerover', () => {
            quitButton.setFill('#0000ff'); // Blue
            this.game.canvas.style.cursor = 'pointer'; // Change cursor to pointer
        });

        // Add pointerout event to remove hover effect
        quitButton.on('pointerout', () => {
            quitButton.setFill('#ffffff'); // White
            this.game.canvas.style.cursor = 'default'; // Change cursor back to default
        });
        quitButton.on('pointerdown', () => {
            // Show modal
            this.handleClick();
        });
        quitButtonBackground.on('pointerdown', () => {
            this.handleClick();
        })
        quitButton.setOrigin(0.5);
        
    }
    handleClick() {
        this.modal.setVisible(true);
        this.confirmText.setVisible(true);
        this.continueButton.setVisible(true);
    };
    
}
