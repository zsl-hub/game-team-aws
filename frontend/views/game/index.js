import "./style.css";
import Phaser from 'phaser';
import BoardScene from './boardScene';
import GameScene from './gameScene';

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const sizes = {
  width: screenWidth * 0.8,
  height: screenHeight * 0.9
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  scene: [BoardScene, GameScene],
};

const game = new Phaser.Game(config);