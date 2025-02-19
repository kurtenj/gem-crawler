import { LEVEL_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { LevelGenerator } from '../level/LevelGenerator.js';
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
        
        // Create player
        this.player = new Player(this, 100, 300);
        
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

        console.log('Scene creation complete');
    }

    collectKey(player, key) {
        this.hasKey = true;
        key.destroy();
        
        // Play collection effect
        this.tweens.add({
            targets: this.door,
            scaleX: this.SCALE * 1.2,
            scaleY: this.SCALE * 1.2,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.door.setFrame(TILES.DOOR.UNLOCKED);
            }
        });
    }

    tryEnterDoor(player, door) {
        if (this.hasKey) {
            this.hasKey = false;
            door.setFrame(TILES.DOOR.OPEN);
            this.player.enterDoor(door);
        }
    }

    handleEnemyCollision(player, enemy) {
        if (!enemy.isDead) {
            this.scene.restart();
        }
    }

    update(time, delta) {
        this.player.update(time, this.cursors);
        
        // Update crawler animations and movement
        this.crawlers.getChildren().forEach(crawler => {
            if (crawler.update) {
                crawler.update();
            }
        });
    }
} 