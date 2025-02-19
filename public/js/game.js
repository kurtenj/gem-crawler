import { GAME_CONFIG } from './modules/config.js';
import { MainScene } from './modules/scenes/MainScene.js';

GAME_CONFIG.scene = MainScene;
new Phaser.Game(GAME_CONFIG); 