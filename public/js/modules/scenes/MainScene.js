import { LEVEL_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { LevelGenerator } from '../level/LevelGenerator.js';
import { GameUI } from '../ui/GameUI.js';
import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.player = null;
        this.platforms = null;
        this.crawlers = null;
        this.key = null;
        this.door = null;
        this.hasKey = false;
        this.currentLevel = 1;
        this.currentTheme = 'Dungeon';
        this.SCALE = LEVEL_CONFIG.SCALE;
        this.TILE_SIZE = LEVEL_CONFIG.TILE_SIZE;
        this.CANVAS_WIDTH = LEVEL_CONFIG.CANVAS_WIDTH;
        this.LEVEL_WIDTH = LEVEL_CONFIG.LEVEL_WIDTH;
        this.LEVEL_HEIGHT = LEVEL_CONFIG.LEVEL_HEIGHT;
        this.GROUND_Y = this.LEVEL_HEIGHT - (this.TILE_SIZE * 2);
    }

    preload() {
        console.log('Preloading assets...');
        this.load.spritesheet('tilemap', '/assets/tilemap.png', {
            frameWidth: 16,
            frameHeight: 16,
            spacing: 0,
            margin: 0
        });
    }

    create() {
        console.log('Creating scene...');
        // Initialize physics groups
        this.platforms = this.physics.add.staticGroup();
        this.crawlers = this.physics.add.group();
        
        // Generate level
        const levelGenerator = new LevelGenerator(this);
        levelGenerator.generate();
        
        // Create player on the starting platform
        const startX = 24 + (LEVEL_CONFIG.TILE_SIZE / 2); // Center of first platform tile (24px + half tile)
        const startY = this.GROUND_Y - 96 - LEVEL_CONFIG.TILE_SIZE; // Platform Y (GROUND_Y - 96) minus one full tile height
        this.player = new Player(this, startX, startY);
        
        // Add colliders
        this.physics.add.collider(this.player.sprite, this.platforms);
        this.physics.add.collider(this.crawlers, this.platforms);
        this.physics.add.collider(this.player.sprite, this.crawlers, this.handleEnemyCollision, null, this);
        
        // Add key collection
        this.physics.add.overlap(this.player.sprite, this.key, this.collectKey, null, this);
        // Add door interaction
        this.physics.add.overlap(this.player.sprite, this.door, this.tryEnterDoor, null, this);
        
        // Set up controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Set up camera with smoother follow
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 100);
        this.cameras.main.setBounds(0, 0, this.LEVEL_WIDTH, this.LEVEL_HEIGHT);
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, this.LEVEL_WIDTH, this.LEVEL_HEIGHT);

        // Create UI
        this.ui = new GameUI(this);
        this.ui.updateLevel(this.currentLevel);
        this.ui.updateTheme(this.currentTheme);
        this.ui.setKeyStatus(this.hasKey);

        console.log('Scene creation complete');
    }

    collectKey(player, key) {
        // Stop the existing floating animations
        this.tweens.killTweensOf(key);
        
        // Set hasKey flag and update UI
        this.hasKey = true;
        this.ui.setKeyStatus(true);
        
        // Calculate the viewport-relative position for the UI key icon
        const targetX = this.cameras.main.scrollX + this.ui.keyIcon.x;
        const targetY = this.cameras.main.scrollY + this.ui.keyIcon.y;
        
        // Play collection animation
        this.tweens.add({
            targets: key,
            x: targetX,
            y: targetY,
            alpha: 0,
            angle: 180,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 600,
            ease: 'Linear',
            onComplete: () => {
                key.destroy();
            }
        });
        
        // Play door effect
        this.tweens.add({
            targets: this.door,
            scaleX: this.SCALE * 1.2,
            scaleY: this.SCALE * 1.2,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.door.setFrame(TILES.BASIC.DOOR.UNLOCKED);
            }
        });
    }

    tryEnterDoor(player, door) {
        if (this.hasKey) {
            this.hasKey = false;
            door.setFrame(TILES.BASIC.DOOR.OPEN);
            this.player.enterDoor(door);
            this.currentLevel++;
            
            // Scene will restart, UI will update in create()
        }
    }

    handleEnemyCollision(player, enemy) {
        if (!enemy.isDead) {
            // Disable further collisions during death animation
            this.physics.world.disable(player);
            this.physics.world.disable(enemy);
            
            // Stop player movement
            player.setVelocity(0, 0);
            
            // Play death animation
            this.player.die();
        }
    }

    update(time, delta) {
        // Update player
        if (this.player) {
            this.player.update(time, this.cursors);
        }
        
        // Update crawler animations and movement
        this.crawlers.getChildren().forEach(crawler => {
            if (crawler.update) {
                crawler.update();
            }
        });
    }
} 