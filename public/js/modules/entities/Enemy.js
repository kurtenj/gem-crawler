import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;
import { LEVEL_CONFIG } from '../config.js';

export class Crawler {
    constructor(scene, x, y, platform) {
        this.scene = scene;
        this.sprite = scene.crawlers.create(x, y, 'tilemap', TILES.ENEMIES.CRAWLER.IDLE);
        this.sprite.crawler = this; // Attach crawler instance to sprite
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
        
        // Set up physics body to match 16x16 sprite size
        this.sprite.body.setSize(16, 16); // Base sprite size without scaling
        this.sprite.body.setOffset(0, 0);
        this.sprite.body.setAllowGravity(true);

        if (this.scene.physics.config.debug) {
            console.log('Crawler physics body:', {
                width: this.sprite.body.width,
                height: this.sprite.body.height,
                offset: this.sprite.body.offset,
                scale: this.sprite.scale
            });
        }

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
        if (!this.scene.anims.exists('crawler-walk')) {
            this.scene.anims.create({
                key: 'crawler-walk',
                frames: [
                    { key: 'tilemap', frame: TILES.ENEMIES.CRAWLER.WALK.START },
                    { key: 'tilemap', frame: TILES.ENEMIES.CRAWLER.WALK.END }
                ],
                frameRate: 6,
                repeat: -1
            });
        }
        
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

    die() {
        console.log('Enemy die() method called');
        if (!this.sprite.isDead) {
            console.log('Setting enemy to dead state');
            this.sprite.isDead = true;
            this.sprite.setVelocity(0, 0);
            this.sprite.setFrame(TILES.ENEMIES.CRAWLER.DEAD);
            this.sprite.body.enable = false;
            
            // Create spirit sprite that rises
            const spiritSprite = this.scene.add.sprite(
                this.sprite.x,
                this.sprite.y,
                'tilemap',
                TILES.ENEMIES.CRAWLER.DEAD
            );
            spiritSprite.setScale(this.scene.SCALE);
            spiritSprite.setAlpha(0.7);
            spiritSprite.setTint(0x88FFFF); // Light blue tint for spirit
            
            // Create particle effect for death
            const deathEmitter = this.scene.add.particles(0, 0, 'tilemap', {
                frame: TILES.ENEMIES.CRAWLER.DEAD,
                lifespan: 800,
                speed: { min: 50, max: 100 },
                scale: { start: 0.5, end: 0 },
                quantity: 1,
                alpha: { start: 0.5, end: 0 },
                tint: 0x88FFFF,
                emitting: false
            });
            
            deathEmitter.setPosition(this.sprite.x, this.sprite.y);
            deathEmitter.explode(8); // Create burst of particles
            
            // Fade out original sprite
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 500,
                ease: 'Power2'
            });
            
            // Animate spirit rising and fading
            this.scene.tweens.add({
                targets: spiritSprite,
                y: this.sprite.y - 100,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 1000,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    console.log('Enemy death animation complete');
                    spiritSprite.destroy();
                    deathEmitter.destroy();
                    this.sprite.destroy();
                }
            });
            
            // Add gentle rotation to spirit
            this.scene.tweens.add({
                targets: spiritSprite,
                angle: Phaser.Math.Between(-20, 20),
                duration: 1000,
                ease: 'Sine.easeInOut'
            });
        } else {
            console.log('Enemy was already dead');
        }
    }

    static createForPlatform(scene, platform, width) {
        const crawlerChance = width * 0.2; // 40% chance for width 2, 60% for width 3, 80% for width 4
        if (Math.random() < crawlerChance) {
            // Position crawler in the middle of the platform
            const x = platform.x;
            const y = platform.y - (LEVEL_CONFIG.TILE_SIZE / 2); // Position exactly on top of platform
            return new Crawler(scene, x, y, platform);
        }
        return null;
    }
} 