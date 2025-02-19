import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;
import { LEVEL_CONFIG } from '../config.js';

export class Crawler {
    constructor(scene, x, y, platform) {
        this.scene = scene;
        this.sprite = scene.crawlers.create(x, y, 'tilemap', TILES.CRAWLER.IDLE);
        this.setupSprite();
        this.setupPatrol(platform);
        this.createAnimations();
    }

    setupSprite() {
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        this.sprite.setScale(LEVEL_CONFIG.SCALE);
        this.sprite.isDead = false;
        this.sprite.setOrigin(0.5, 0.5);
        
        // Set exact 48x48 collision box
        this.sprite.body.setSize(16, 16); // 16x16 is the base sprite size
        this.sprite.body.setOffset(0, 0); // Center the collision box
        this.sprite.body.setAllowGravity(true);

        // Add collision callback
        this.sprite.body.onWorldBounds = true;
        this.scene.physics.world.on('worldbounds', this.handleCollision, this);
    }

    setupPatrol(platform) {
        this.sprite.currentPlatform = platform;
        
        // Store platform reference and calculate patrol boundaries
        const platformWidth = platform.platformWidth || LEVEL_CONFIG.TILE_SIZE;
        this.sprite.patrolLeftBound = platform.x - (platformWidth / 2) + (LEVEL_CONFIG.TILE_SIZE / 2);
        this.sprite.patrolRightBound = platform.x + (platformWidth / 2) - (LEVEL_CONFIG.TILE_SIZE / 2);
        
        // Set patrol speed
        this.patrolSpeed = 75;
        
        // Track last position for stuck detection
        this.lastX = this.sprite.x;
        this.stuckCheckCounter = 0;
        
        // Randomize initial direction
        this.sprite.direction = Math.random() < 0.5 ? -1 : 1;
        this.sprite.setVelocityX(this.patrolSpeed * this.sprite.direction);
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'crawler-walk',
            frames: [
                { key: 'tilemap', frame: TILES.CRAWLER.WALK_1 },
                { key: 'tilemap', frame: TILES.CRAWLER.WALK_2 }
            ],
            frameRate: 6,
            repeat: -1
        });
        
        this.sprite.anims.play('crawler-walk', true);
    }

    handleCollision(body, up, down, left, right) {
        if (body.gameObject === this.sprite && (left || right)) {
            this.changeDirection();
        }
    }

    changeDirection() {
        this.sprite.direction *= -1;
        this.sprite.setVelocityX(this.patrolSpeed * this.sprite.direction);
    }

    update() {
        if (this.sprite.isDead) return;

        // Check if crawler is at platform edge or patrol boundary
        const isAtRightBound = this.sprite.x >= this.sprite.patrolRightBound;
        const isAtLeftBound = this.sprite.x <= this.sprite.patrolLeftBound;

        // Check if stuck by comparing current position to last position
        this.stuckCheckCounter++;
        if (this.stuckCheckCounter >= 30) { // Check every 30 frames
            if (Math.abs(this.sprite.x - this.lastX) < 1) { // If barely moved
                this.changeDirection();
            }
            this.lastX = this.sprite.x;
            this.stuckCheckCounter = 0;
        }

        // Turn around if at boundary
        if ((this.sprite.direction === 1 && isAtRightBound) || 
            (this.sprite.direction === -1 && isAtLeftBound)) {
            this.changeDirection();
        } else {
            // Maintain patrol speed (in case of physics interactions)
            this.sprite.setVelocityX(this.patrolSpeed * this.sprite.direction);
        }

        // Update flip based on direction
        this.sprite.setFlipX(this.sprite.direction === -1);
    }

    static createForPlatform(scene, platform, width) {
        const crawlerChance = width * 0.2; // 40% chance for width 2, 60% for width 3, 80% for width 4
        if (Math.random() < crawlerChance) {
            // Position crawler in the middle of the platform
            const x = platform.x;
            const y = platform.y - (LEVEL_CONFIG.TILE_SIZE / 2);
            return new Crawler(scene, x, y, platform);
        }
        return null;
    }
} 