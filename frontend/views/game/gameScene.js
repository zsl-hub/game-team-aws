import './style.css';
import Phaser from 'phaser';
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
        this.currentPlayerIndex = 0; // 0 for Player 1, 1 for Player 2
        this.turnTimeLimit = 60000; // 1 minute in milliseconds
        this.timer = null;
        this.timeText = null;
        this.remainingTime = this.turnTimeLimit;
        this.turnStartTime = null; // New property to store the start time of the turn
        this.isVisible = true; // New property to track visibility
    }

    create() {
        const width = this.scale.width / 2;
        const height = this.scale.height;
        const cellSize = Math.min(width, height) / 15;

        const boardYOffset = -height * 0.05;
        const boardStartX = (width - cellSize * 10) / 2;
        const boardStartY = (height - cellSize * 10) / 2 + boardYOffset;

        const playerBackground = this.add.image(boardStartX + (cellSize * 10) / 2, boardStartY + (cellSize * 10) / 2, 'background');
        playerBackground.setDisplaySize(cellSize * 10, cellSize * 10);
        playerBackground.setOrigin(0.5);

        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const rect = this.add.rectangle(x * cellSize + boardStartX, y * cellSize + boardStartY, cellSize, cellSize);
                rect.setStrokeStyle(2, 0xffffff);
                rect.setOrigin(0);
                // Initialize isShot state to false for each cell
                rect.setData('isShot', false);
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
                rect.on('pointerdown', () => {
                    this.handleShot(rect);
                });
            }
        }
        const playerPosX = boardStartX + width * 0.5;
        const enemyPosX = boardStartX + width * 0.5 - enemyBoardOffsetX;
        // const ships = this.registry.get('ships'); // Can be changed to load data from database
        // ships.forEach(shipData => {
        //     const ship = this.add.sprite(shipData.lastValidPosition.x - playerPosX, shipData.lastValidPosition.y, shipData.textureKey);
        //     ship.setDisplaySize(shipData.displayWidth, shipData.displayHeight);
        //     ship.setOrigin(0.5, 1);
        //     ship.angle = shipData.angle;
        //     ship.isPlaced = true;
        // });

        const yBoard = this.add.text(width * 0.5, height * 0.15 + boardYOffset, 'Your Board', { fontSize: width * 0.05, fill: '#fff' });
        yBoard.setOrigin(0.5);
        const eBoard = this.add.text(width * 1.5, height * 0.15 + boardYOffset, 'Enemy Board', { fontSize: width * 0.05, fill: '#fff' });
        eBoard.setOrigin(0.5);

        this.winnerText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '', { fontSize: width * 0.05, fill: '#ffffff' });
        this.winnerText.setOrigin(0.5);
        this.winnerText.setVisible(false);

        this.modal = this.add.graphics();
        this.modal.fillStyle(0x0000ff, 0.5);
        this.modal.fillRect(0, 0, this.scale.width, this.scale.height);
        this.modal.setVisible(false);

        this.confirmText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Are you sure you want to quit? You will lose the game.', { fontSize: width * 0.05, fill: '#ffffff' });
        this.confirmText.setOrigin(0.5);
        this.confirmText.setVisible(false);

        this.continueButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Continue', { fontSize: width * 0.05, fill: '#ffffff' });
        this.continueButton.setOrigin(0.5);
        this.continueButton.setInteractive();
        this.continueButton.setVisible(false);

        this.continueButton.on('pointerover', () => {
            this.continueButton.setFill('#ff0000');
            this.game.canvas.style.cursor = 'pointer';
        });

        this.continueButton.on('pointerout', () => {
            this.continueButton.setFill('#ffffff');
            this.game.canvas.style.cursor = 'default';
        });

        this.continueButton.on('pointerdown', () => {
            this.endGame(1 - this.currentPlayerIndex);
            this.modal.setVisible(false);
            this.confirmText.setVisible(false);
            this.continueButton.setVisible(false);
        });

        const quitButtonBackground = this.add.rectangle(width * 0.5, height * 0.9, width * 0.24, height * 0.08, 0xff0000);
        quitButtonBackground.setOrigin(0.5);
        quitButtonBackground.setInteractive();

        const quitButton = this.add.text(width * 0.5, height * 0.9, 'QUIT', { fontSize: width * 0.05, fill: '#ffffff' });
        quitButton.setOrigin(0.5);
        quitButton.setInteractive();

        quitButtonBackground.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
        });
        quitButtonBackground.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
        });

        quitButton.on('pointerover', () => {
            quitButton.setFill('#0000ff');
            this.game.canvas.style.cursor = 'pointer';
        });

        quitButton.on('pointerout', () => {
            quitButton.setFill('#ffffff');
            this.game.canvas.style.cursor = 'default';
        });
        quitButton.on('pointerdown', () => {
            this.handleClick();
        });
        quitButtonBackground.on('pointerdown', () => {
            this.handleClick();
        });
        quitButton.setOrigin(0.5);

        this.timeText = this.add.text(width, height * 0.05, 'Time: 60', { fontSize: width * 0.05, fill: '#ffffff' });
        this.timeText.setOrigin(0.5);

        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        this.startTurnTimer();
    }

    handleClick() {
        this.modal.setVisible(true);
        this.confirmText.setVisible(true);
        this.continueButton.setVisible(true);
    }

    handleShot(rect) {
        if (this.players[this.currentPlayerIndex].isInGame) {
            // Check if the cell has been shot already
            if (!rect.getData('isShot')) {
                if (this.currentPlayerIndex === 0) {
                    rect.setFillStyle(0x00ff00, 1);
                } else {
                    rect.setFillStyle(0x0000ff, 1);
                }

                // Mark the cell as shot
                rect.setData('isShot', true);

                this.currentPlayerIndex = 1 - this.currentPlayerIndex;
                this.startTurnTimer();
            }
        }
    }

    startTurnTimer() {
        if (this.timer) {
            this.timer.remove(false);
        }

        this.turnStartTime = Date.now();
        this.remainingTime = this.turnTimeLimit;
        this.updateTimeText();

        this.timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.remainingTime -= 1000;
                this.updateTimeText();

                if (this.remainingTime <= 0) {
                    this.timer.remove(false);
                    this.endGameDueToTimeout();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            this.isVisible = false;
            if (this.timer) {
                this.timer.paused = true;
            }
        } else {
            this.isVisible = true;
            if (this.timer) {
                const now = Date.now();
                const elapsed = now - this.turnStartTime;
                this.remainingTime -= elapsed;

                if (this.remainingTime <= 0) {
                    this.remainingTime = 0;
                    this.timer.paused = false;
                    this.timer.remove(false);
                    this.endGameDueToTimeout();
                } else {
                    this.turnStartTime = now;
                    this.timer.paused = false;
                }
                this.updateTimeText();
            }
        }
    }

    updateTimeText() {
        const remainingSeconds = Math.floor(this.remainingTime / 1000);
        this.timeText.setText(`Time: ${remainingSeconds}`);
    }

    endGameDueToTimeout() {
        const loser = this.players[this.currentPlayerIndex];
        loser.isInGame = false;
        const winnerIndex = 1 - this.currentPlayerIndex;
        this.endGame(winnerIndex);
    }

    endGame(winnerIndex) {
        if (this.timer) {
            this.timer.remove(false);
        }

        const winner = this.players[winnerIndex];
        this.winnerText.setText(`${winner.name} wins!`);
        this.winnerText.setVisible(true);

        setTimeout(() => {
            window.location.href = '../lobby/lobby.html';
        }, 3000);
    }

    shutdown() {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
}
